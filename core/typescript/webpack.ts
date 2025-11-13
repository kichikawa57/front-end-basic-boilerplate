import path from "node:path";
import TerserPlugin from "terser-webpack-plugin";
import webpack, { type Configuration } from "webpack";
import { conf } from "../config";
import { DEFAULT_FILE, DIR, EXTENSION, OUTPUT_DIR } from "../constants";
import { getDirsSync } from "../helper/utils";

const { env } = conf;

const defaultStatsOptions = {
  hash: false,
  timings: false,
  chunks: false,
  chunkModules: false,
  modules: false,
  children: true,
  version: true,
  cached: true,
  cachedAssets: true,
  reasons: true,
  source: true,
  errorDetails: true
};

const isProduction = env === "production";

const entries = async () => {
  const entries: { [key: string]: string } = {};

  const ignore = isProduction
    ? [`${DIR.SRC}/**/_*${EXTENSION.TS}`, `${DIR.SRC}/${DIR.SHARED}/**`]
    : [`${DIR.SRC}/**/_*${EXTENSION.TS}`, `${DIR.SRC}/${DIR.SHARED}/common/**`];

  const entryPath = isProduction
    ? `${DIR.SRC}/**/${DIR.SCRIPT}/${DEFAULT_FILE}${EXTENSION.TS}`
    : `${DIR.SRC}/**/*${EXTENSION.TS}`;

  const { resolve } = await getDirsSync(entryPath, {
    ignore
  });

  if (!resolve) return entries;

  for (const dir of resolve) {
    const regEx = new RegExp(`${DIR.SRC}/`);
    const key = dir.replace(regEx, "").replace(".ts", ".js");

    entries[key] = `${path.resolve("")}/${dir}`;
  }

  return entries;
};

export const webpackConf = ({
  noSharedItems
}: {
  noSharedItems?: boolean;
}): Configuration => {
  return {
    entry: async () => await entries(),
    mode: isProduction ? "production" : "development",
    output: {
      path: `${path.resolve("")}/${OUTPUT_DIR}`,
      filename: "[name]",
      publicPath: "/"
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          loader: "ts-loader"
        }
      ]
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          extractComments: "all",
          terserOptions: {
            compress: {
              drop_console: true
            }
          }
        })
      ],
      ...(noSharedItems
        ? {}
        : {
            splitChunks: {
              name: "shared/script/vendor.js",
              chunks: "initial",
              cacheGroups: {
                default: false
              }
            }
          })
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.ENV": JSON.stringify(process.env.NODE_ENV)
      })
    ],
    stats: defaultStatsOptions,
    resolve: {
      modules: [path.resolve(DIR.SRC), "node_modules"],
      extensions: [EXTENSION.TS, EXTENSION.JS]
    }
  };
};
