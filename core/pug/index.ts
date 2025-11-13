import path from "node:path";
import Pug from "pug";
import {
  COMMAND,
  DEFAULT_FILE,
  DIR,
  EXTENSION,
  OUTPUT_DIR
} from "../constants";
import {
  err,
  exec,
  getDirsSync,
  log,
  ok,
  readFile,
  type TResultPromise,
  writeFile
} from "../helper/utils";
import { Chokidar } from "../helper/watch";
import type { HtmlOption } from "../types";

type RenderOption = {
  entry: string;
  outDir: string;
  outPath: string;
  data: { [key: string]: any };
};

// Pugのレンダリング
const render = ({ entry, outDir, outPath, data }: RenderOption) => {
  return new Promise<TResultPromise<string, Error>>(async (resolve) => {
    const readFileResult = await readFile(entry);

    if (readFileResult.reject || !readFileResult.resolve) {
      log("error", `Failed to read Pug file: ${entry}`);
      resolve(err(readFileResult.reject));
      return;
    }

    const html = readFileResult.resolve;
    const distFile = `${path.join(OUTPUT_DIR, outDir)}${outPath}`;

    Pug.render(
      html,
      {
        filename: entry,
        pretty: true,
        cache: false,
        basedir: path.join(DIR.SRC),
        data
      },
      async (error, data) => {
        if (error) {
          log("error", `Pug rendering error for ${entry}`);
          log("error", error.message);
          resolve(err(error));
          return;
        }

        const writeFileResult = await writeFile(distFile, data);

        if (writeFileResult.reject && writeFileResult.err) {
          log("error", `Error writing rendered HTML: ${distFile}`);
          log("error", writeFileResult.reject.message);
          resolve(err(writeFileResult.reject));
          return;
        }

        log("success", `Pug successfully built: ${distFile}`);
        resolve(ok(distFile));
      }
    );
  });
};

// レンダリングに必要なパスを生成
const getPath = (dir: string) => {
  const fileName = dir.split("/").pop() || `${DEFAULT_FILE}${EXTENSION.PUG}`;
  const outputPath =
    dir
      .replace(new RegExp(`${DIR.SRC}/`), "")
      .replace(new RegExp(`${DIR.TEMPLATE}/`), "")
      .replace(new RegExp(`${fileName}`), "") || "/";

  const outPutFile = fileName.replace(
    new RegExp(EXTENSION.PUG),
    EXTENSION.HTML
  );

  return { fileName, outputPath, outPutFile };
};

// 複数のPugをレンダリング
export const renderPugFiles = async ({
  entry,
  data,
  option
}: HtmlOption): Promise<TResultPromise<string, Error>> => {
  const { resolve, reject } = await getDirsSync(entry, option);

  if (reject || !resolve) {
    log(
      "error",
      `Error retrieving Pug directories: ${reject ? reject.message : ""}`
    );
    return err(reject);
  }

  log("success", "Validating Pug templates...");
  const execResult = await exec(COMMAND.PUG_LINT);

  if (execResult.reject && execResult.err) {
    log("error", "Pug validation error");
    log("error", execResult.reject.message);
    return err(execResult.reject);
  }

  const promises = resolve.map((dir) => {
    const { outputPath, outPutFile } = getPath(dir);
    return render({
      entry: dir,
      outDir: outputPath,
      outPath: outPutFile,
      data
    });
  });

  const results = await Promise.all(promises);
  const errs = results.filter((r) => r.err);

  if (errs.length > 0) {
    log("error", "Rendering errors occurred for PUG");
    return err(errs[0].reject);
  }

  log("success", "All Pug templates successfully rendered.");
  return ok("All Pug templates rendered successfully.");
};

// 指定したパスのPugをレンダリング
export const renderPugFile = async ({
  entry,
  data
}: HtmlOption): Promise<TResultPromise<string, Error>> => {
  log("success", `Starting Pug rendering for: ${entry}`);

  const execResult = await exec(COMMAND.PUG_LINT);

  if (execResult.reject && execResult.err) {
    log("error", "Pug validation error");
    log("error", execResult.reject.message);
    return err(execResult.reject);
  }

  const { outPutFile, outputPath } = getPath(entry);
  const renderResult = await render({
    entry,
    outDir: outputPath,
    outPath: outPutFile,
    data
  });

  if (renderResult.err && renderResult.reject) {
    log("error", `Rendering error for: ${entry}`);
    return err(renderResult.reject);
  }

  log("success", `Successfully rendered: ${entry}`);
  return ok("Pug template rendered successfully.");
};

// 変更を監視
export const watchPugFiles = async (args: HtmlOption) => {
  const { entry, option, noSharedItems } = args;

  const { resolve, reject } = await getDirsSync(entry, option);

  if (reject || !resolve) {
    log(
      "error",
      `Error retrieving watch directories: ${reject ? reject.message : ""}`
    );
    return err(reject);
  }

  const sharedDir = await getDirsSync(
    `${DIR.SRC}/${DIR.SHARED}/**/*${EXTENSION.PUG}`,
    {}
  );

  if (sharedDir.reject || !sharedDir.resolve) {
    log(
      "error",
      `Error retrieving shared directories: ${sharedDir.reject ? sharedDir.reject.message : ""}`
    );
    return err(reject);
  }

  const chokidar = new Chokidar(resolve);
  const chokidarShared = new Chokidar(sharedDir.resolve);

  chokidar.watcher({
    change: async (path: string) => {
      log("success", `Detected change in template: ${path}`);
      await renderPugFiles({
        ...args,
        entry: `${path.split(DIR.TEMPLATE)[0]}/${DIR.TEMPLATE}/**/*${EXTENSION.PUG}`
      });
    }
  });

  if (!noSharedItems) {
    chokidarShared.watcher({
      change: async () => {
        log(
          "success",
          "Detected change in shared templates. Re-rendering all templates."
        );
        await renderPugFiles(args);
      }
    });
  }

  log("success", "Watching templates for changes...");
};
