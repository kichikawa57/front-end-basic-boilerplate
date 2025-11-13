export { generateUIToAllPackages } from "./generateUIToAllPackages";
export { checkDir, log } from "./helper/utils";

import type { WatchingScssOption } from "types";
import { browser } from "./browser";
import { DIR, EXTENSION } from "./constants";
import { copyCssFiles, watchCssFiles } from "./css";
import { err, log, ok } from "./helper/utils";
import { optimizeImages, watchOptimizeImage } from "./image";
import { copyJavascriptFiles, watchJavascriptFiles } from "./javascript";
import { copyJsonFiles, watchJsonFiles } from "./json";
import { copyPhpFiles, watchPhpFiles } from "./php";
import { renderPugFiles, watchPugFiles } from "./pug";
import { renderScssFiles, watchScssFiles } from "./scss";
import { renderMultipleTypescript, watchTypescriptFiles } from "./typescript";

export type RenderOption = {
  pugData?: { [key: string]: any };
  noSharedItems?: boolean;
  runs: {
    javascript?: boolean;
    typescript?: boolean;
    css?: boolean;
    scss?: boolean;
    image?: boolean;
    pug?: boolean;
    php?: boolean;
    json?: boolean;
  };
};

export type WatchOption = {
  pugData?: { [key: string]: any };
  noSharedItems?: boolean;
  scssOption?: Partial<WatchingScssOption>;
  runs: {
    javascript?: boolean;
    scss?: boolean;
    pug?: boolean;
    css?: boolean;
    browser?: boolean;
    image?: boolean;
    php?: boolean;
    json?: boolean;
    typescript?: boolean;
  };
};

export const renders = async ({
  pugData,
  noSharedItems,
  runs: { typescript, scss, image, pug, javascript, css, php, json }
}: RenderOption) => {
  const renderPromises = [];

  if (pug) {
    renderPromises.push(
      renderPugFiles({
        entry: `${DIR.SRC}/**/*${EXTENSION.PUG}`,
        data: pugData ?? {},
        noSharedItems,
        option: {
          ignore: [
            `${DIR.SRC}/**/_*${EXTENSION.PUG}`,
            `${DIR.SRC}/${DIR.SHARED}/common/**/*${EXTENSION.PUG}`
          ]
        }
      })
    );
  }

  if (scss) {
    renderPromises.push(
      renderScssFiles({
        entry: `${DIR.SRC}/**/*${EXTENSION.SCSS}`,
        noSharedItems,
        option: {
          ignore: [
            `${DIR.SRC}/**/_*${EXTENSION.SCSS}`,
            `${DIR.SRC}/${DIR.SHARED}/common/**/*${EXTENSION.SCSS}`
          ]
        }
      })
    );
  }

  if (css) {
    renderPromises.push(
      copyCssFiles({
        entry: `${DIR.SRC}/**/*${EXTENSION.CSS}`,
        option: {
          ignore: [`${DIR.SRC}/**/_*${EXTENSION.CSS}`]
        }
      })
    );
  }

  if (php) {
    renderPromises.push(
      copyPhpFiles({
        entry: `${DIR.SRC}/**/*${EXTENSION.PHP}`,
        option: {}
      })
    );
  }

  if (typescript) {
    renderPromises.push(renderMultipleTypescript({ noSharedItems }));
  }

  if (javascript) {
    renderPromises.push(
      copyJavascriptFiles({
        entry: `${DIR.SRC}/**/*${EXTENSION.JS}`,
        option: {
          ignore: [`${DIR.SRC}/**/_*${EXTENSION.JS}`]
        }
      })
    );
  }

  if (json) {
    renderPromises.push(
      copyJsonFiles({
        entry: `${DIR.SRC}/**/*${EXTENSION.JSON}`,
        option: {}
      })
    );
  }

  if (image) {
    renderPromises.push(optimizeImages());
  }

  const promises = await Promise.all(renderPromises);

  if (promises.some((r) => r.err)) {
    return err(new Error("✖︎ Failed to render all files"));
  }

  log("success", "Successfully rendered all files");

  return ok("Successfully rendered all files");
};

// 監視の処理
export const watch = async ({
  pugData,
  scssOption,
  noSharedItems,
  runs: {
    browser: openBrowser,
    scss,
    pug,
    javascript,
    image,
    css,
    php,
    json,
    typescript
  }
}: WatchOption) => {
  if (pug) {
    await watchPugFiles({
      entry: `${DIR.SRC}/**/*${EXTENSION.PUG}`,
      data: pugData ?? {},
      option: {},
      noSharedItems
    });
  }

  if (scss) {
    await watchScssFiles({
      entry: scssOption?.entry ?? `${DIR.SRC}/**/*${EXTENSION.SCSS}`,
      noSharedItems,
      option: scssOption?.option ?? {},
      renderOption: scssOption?.renderOption ?? {}
    });
  }

  if (css) {
    await watchCssFiles({
      entry: `${DIR.SRC}/**/*${EXTENSION.CSS}`,
      option: {}
    });
  }

  if (php) {
    await watchPhpFiles({
      entry: `${DIR.SRC}/**/*${EXTENSION.PHP}`,
      option: {}
    });
  }

  if (javascript) {
    await watchJavascriptFiles({
      entry: `${DIR.SRC}/**/*${EXTENSION.JS}`,
      option: {}
    });
  }

  if (json) {
    await watchJsonFiles({
      entry: `${DIR.SRC}/**/*${EXTENSION.JSON}`,
      option: {}
    });
  }

  if (image) {
    await watchOptimizeImage(`${DIR.SRC}/**/*${EXTENSION.IMAGE}`);
  }

  if (openBrowser) {
    browser({
      noSharedItems: noSharedItems ?? false,
      typescript: typescript ?? false
    });
  } else if (!openBrowser && typescript) {
    await watchTypescriptFiles({
      entry: `${DIR.SRC}/**/*${EXTENSION.TS}`,
      option: {},
      noSharedItems
    });
  }
};
