import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import sharp from "sharp";
import { optimize } from "svgo";
import { DIR, EXTENSION, OUTPUT_DIR } from "../constants";
import {
  err,
  getDirsSync,
  log,
  ok,
  type TResultPromise,
  writeFile
} from "../helper/utils";
import { Chokidar } from "../helper/watch";

const optimizeImage = async (imagePath: string) => {
  const outputPath = imagePath.replace(
    new RegExp(`${DIR.SRC}/`),
    `${OUTPUT_DIR}/`
  );
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const ext = path.extname(imagePath).toLowerCase();

  try {
    if (ext === ".svg") {
      // SVGの場合は SVGO で最適化
      const svgData = fs.readFileSync(imagePath, "utf-8");
      const result = await optimize(svgData, { path: imagePath });
      await writeFile(outputPath, result.data);
    } else {
      // その他の画像は sharp で最適化
      await sharp(imagePath)
        .jpeg({ quality: 80 })
        .png({ quality: 80, compressionLevel: 8 })
        .gif()
        .toFile(outputPath);
    }

    return ok(outputPath);
  } catch (e: unknown) {
    const error = e as Error;
    log("error", `Error processing image ${imagePath}: ${error.message}`);
    return err(new Error(`Error processing image ${imagePath}`));
  }
};

export const optimizeImages: () => Promise<TResultPromise<string, Error>> =
  async () => {
    try {
      const imagePaths = glob.sync(`${DIR.SRC}/**/*${EXTENSION.IMAGE}`);

      const promises: Promise<TResultPromise<string, Error>>[] = imagePaths.map(
        async (imagePath) => {
          return optimizeImage(imagePath);
        }
      );

      await Promise.all(promises);

      log("success", "Images successfully optimized using Sharp and SVGO");
      return ok("success min images");
    } catch (e: unknown) {
      const error = e as Error;
      log("error", `Error processing images: ${error.message}`);
      return err(new Error("Error processing images"));
    }
  };

export const watchOptimizeImage = async (imagePath: string) => {
  const { resolve, reject } = await getDirsSync(imagePath, {});

  if (reject || !resolve) {
    log(
      "error",
      `Error scanning directories:  ${reject ? reject.message : ""}`
    );
    return err(reject);
  }

  const chokidar = new Chokidar(resolve);

  chokidar.watcher({
    change: async (path: string) => {
      log("success", `Starting Image watch in: ${path}`);

      await optimizeImage(path);
    }
  });

  log("success", "Watching for Image changes");
};
