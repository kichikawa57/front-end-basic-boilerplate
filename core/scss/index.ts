import path from "node:path";
import autoPrefixer from "autoprefixer";
import cssDeclarationSorter from "css-declaration-sorter";
import cssnano from "cssnano";
import postcss, { type AcceptedPlugin, type ProcessOptions } from "postcss";
import nested from "postcss-nested";
import postcssReporter from "postcss-reporter";
import postScss from "postcss-scss";
import sass from "sass";
import { DEFAULT_FILE, DIR, EXTENSION, OUTPUT_DIR } from "../constants";
import {
  err,
  getDirsSync,
  log,
  ok,
  readFile,
  type TResultPromise,
  writeFile
} from "../helper/utils";
import { Chokidar } from "../helper/watch";
import type { ScssOption, WatchingScssOption } from "../types";

const styleLintPlugin: AcceptedPlugin[] = [
  postcssReporter({ clearReportedMessages: true })
];

const postCssPlugin: AcceptedPlugin[] = [
  postcssReporter({ clearReportedMessages: true }),
  cssDeclarationSorter({ order: "smacss" }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cssnano({ preset: "default" }) as any,
  require("postcss-combine-media-query"),
  autoPrefixer(["last 2 versions", "ie >= 11", "Android >= 4"]),
  nested()
];

const postCssOption: ProcessOptions = {
  from: "/",
  to: "/",
  map: false,
  syntax: postScss
};

// postCssのレンダリング処理
const renderPostCss = (
  css: string,
  plugins: AcceptedPlugin[],
  option: ProcessOptions
) => {
  return new Promise<TResultPromise<string, Error>>((resolve) => {
    postcss(plugins)
      .process(css, option)
      .then((result) => resolve(ok(result.css)))
      .catch((e) => {
        log("error", `PostCSS rendering failed: ${e}`);
        resolve(err(new Error(e as string)));
      });
  });
};

// scssのレンダリング処理
const renderScss = (entry: string) => {
  return new Promise<TResultPromise<string, Error>>((resolve) => {
    const result = sass.compile(entry);

    if (result.css) {
      log("success", `SCSS successfully rendered: ${entry}`);
      resolve(ok(result.css.toString()));
    } else {
      log("error", `Failed to render SCSS: ${entry}`);
      resolve(err(new Error("SCSS rendering error")));
    }
  });
};

// scss、postcssのレンダリングを統合
const render = async (
  entry: string,
  outDir: string,
  outPath: string
): Promise<TResultPromise<string, Error>> => {
  const file = await readFile(entry);

  if (!file.resolve) {
    log("error", `Failed to read SCSS file: ${entry}`);
    return err(file.reject);
  }

  const styleLintResult = await renderPostCss(
    file.resolve,
    styleLintPlugin,
    postCssOption
  );

  if (styleLintResult.reject && styleLintResult.err) {
    log("error", `Stylelint error: ${entry}`);

    log("error", styleLintResult.reject.message);
    return err(styleLintResult.reject);
  }

  const sassRenderResult = await renderScss(entry);

  if (!sassRenderResult.resolve) {
    log("error", `scss render Error ${entry}`);
    return err(sassRenderResult.reject);
  }

  const postCssResult = await renderPostCss(
    sassRenderResult.resolve,
    postCssPlugin,
    postCssOption
  );

  if (!postCssResult.resolve) {
    log("error", `PostCSS processing failed: ${entry}`);
    log(
      "error",
      postCssResult.reject ? postCssResult.reject.message : "no error"
    );
    return err(postCssResult.reject);
  }

  const distFile = `${path.join(OUTPUT_DIR, outDir)}${outPath}`;

  const writeFileResult = await writeFile(distFile, postCssResult.resolve);

  if (writeFileResult.reject && writeFileResult.err) {
    log("error", `Failed to write CSS: ${entry}`);
    return err(writeFileResult.reject);
  }

  log("success", `CSS successfully generated: ${distFile}`);

  return ok("CSS rendering successful");
};

// レンダリングに必要なパスを生成
const getPath = (dir: string) => {
  const fileName = dir.split("/").pop() || `${DEFAULT_FILE}${EXTENSION.SCSS}`;

  const outputPath =
    dir
      .replace(new RegExp(`${DIR.SRC}/`), "")
      .replace(new RegExp(`${fileName}`), "") || "/";

  const outPutFile = fileName.replace(
    new RegExp(EXTENSION.SCSS),
    EXTENSION.CSS
  );

  return { fileName, outputPath, outPutFile };
};

// 複数のcssをレンダリング
export const renderScssFiles = async ({
  entry,
  option
}: ScssOption): Promise<TResultPromise<string, Error>> => {
  const { resolve, reject } = await getDirsSync(entry, option);

  if (reject || !resolve) {
    log(
      "error",
      `Errors occurred during SCSS rendering. ${reject ? reject.message : ""}`
    );
    return err(reject);
  }

  const promises: Promise<TResultPromise<string, Error>>[] = [];

  for (const dir of resolve) {
    const { outputPath, outPutFile } = getPath(dir);

    promises.push(render(dir, outputPath, outPutFile));
  }

  const results = await Promise.all(promises);

  // エラーチェック
  const errs = results.filter((r) => r.err);
  if (errs.length !== 0) return err(errs[0].reject);

  return ok("All SCSS files successfully rendered.");
};

// 指定したパスのcssをレンダリング
export const renderScssFile = async ({
  entry
}: ScssOption): Promise<TResultPromise<string, Error>> => {
  const { outPutFile, outputPath } = getPath(entry);

  const renderResult = await render(entry, outputPath, outPutFile);

  // エラーチェック
  if (renderResult.err && renderResult.reject) return err(renderResult.reject);

  return ok("CSS rendering successful");
};

// 変更を監視
export const watchScssFiles = async ({
  entry,
  option,
  noSharedItems,
  renderOption
}: WatchingScssOption) => {
  const { resolve, reject } = await getDirsSync(entry, option);

  if (reject || !resolve) {
    log(
      "error",
      `Errors occurred during SCSS rendering. ${reject ? reject.message : ""}`
    );
    return err(reject);
  }

  const sharedDir = await getDirsSync(
    `${DIR.SRC}/${DIR.SHARED}/**/*${EXTENSION.SCSS}`,
    {}
  );

  if (sharedDir.reject || !sharedDir.resolve) {
    log(
      "error",
      `Error scanning directories:  ${sharedDir.reject ? sharedDir.reject.message : ""}`
    );
    return err(reject);
  }

  const chokidar = new Chokidar(resolve);

  chokidar.watcher({
    change: async (path: string) => {
      log("success", `Starting SCSS watch in: ${path}`);

      await renderScssFiles({
        entry:
          renderOption?.entry ??
          `${path.split(DIR.STYLE)[0]}/${DIR.STYLE}/**/*${EXTENSION.SCSS}`,
        option: renderOption?.option ?? {
          ignore: [
            `${path.split(DIR.STYLE)[0]}/${DIR.STYLE}/**/_*${EXTENSION.SCSS}`
          ]
        }
      });
    }
  });

  if (!noSharedItems) {
    const chokidarShared = new Chokidar(sharedDir.resolve);

    chokidarShared.watcher({
      change: async () => {
        log("success", "entry style all");
        await renderScssFiles({
          entry,
          option: {
            ...option,
            ignore: option.ignore
              ? typeof option.ignore === "string"
                ? [
                    `${DIR.SRC}/${DIR.SHARED}/**/_*${EXTENSION.SCSS}`,
                    option.ignore
                  ]
                : Array.isArray(option.ignore)
                  ? [
                      `${DIR.SRC}/${DIR.SHARED}/**/_*${EXTENSION.SCSS}`,
                      ...option.ignore
                    ]
                  : [`${DIR.SRC}/${DIR.SHARED}/**/_*${EXTENSION.SCSS}`]
              : [`${DIR.SRC}/${DIR.SHARED}/**/_*${EXTENSION.SCSS}`]
          }
        });
      }
    });
  }

  log("success", "Watching for SCSS changes");
};
