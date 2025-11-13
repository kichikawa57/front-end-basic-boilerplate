import path from "node:path";
import { DIR, OUTPUT_DIR } from "../constants";
import { copyFile, err, getDirsSync, log, ok } from "../helper/utils";
import { Chokidar } from "../helper/watch";
import type { JsOption } from "../types";

const getPath = (dir: string) => {
  const replacePath = dir.replace(new RegExp(`${DIR.SRC}/`), "");
  const outputPath = path.join(OUTPUT_DIR, replacePath);

  return { outputPath };
};

const copyPhpFile = (dir: string) => {
  const { outputPath } = getPath(dir);
  return copyFile(dir, outputPath);
};

export const copyPhpFiles = async ({ entry, option }: JsOption) => {
  const { resolve, reject } = await getDirsSync(entry, option);

  if (reject || !resolve) {
    log(
      "error",
      `Error retrieving PHP directories: ${reject ? reject.message : ""}`
    );
    return err(reject);
  }

  const promises = resolve.map((dir) => copyPhpFile(dir));

  const results = await Promise.all(promises);
  const errs = results.filter((r) => r.err);

  if (errs.length > 0) {
    log("error", "Copy errors occurred for PHP");
    return err(errs[0].reject);
  }

  log("success", "All PHP files successfully copied.");

  return ok("Successfully copied script");
};

export const watchPhpFiles = async ({ entry, option }: JsOption) => {
  const { resolve, reject } = await getDirsSync(entry, option);

  if (reject || !resolve) {
    log(
      "error",
      `Errors occurred during PHP rendering. ${reject ? reject.message : ""}`
    );
    return err(reject);
  }

  const chokidar = new Chokidar(resolve);

  chokidar.watcher({
    change: async (path: string) => {
      log("success", `Starting PHP watch in: ${path}`);

      await copyPhpFile(path);
    }
  });
};
