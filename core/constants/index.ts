import { conf } from "../config";

const { env } = conf;

const outDir = process.env.OUT_DIR;

export const DIR = {
  SRC: "src",
  TEMPLATE: "template",
  STYLE: "style",
  SCRIPT: "script",
  DIST: "dist",
  SHARED: "shared"
} as const;

const outputDir = (target: string) => {
  if (!outDir) {
    return target;
  }

  return `${target}/${outDir}`;
};

export const OUTPUT_DIR =
  env !== "local" ? outputDir(env) : outputDir(DIR.DIST);
export const DEFAULT_FILE = "index";

export const EXTENSION = {
  PUG: ".pug",
  SCSS: ".scss",
  TS: ".ts",
  HTML: ".html",
  CSS: ".css",
  JS: ".js",
  PHP: ".php",
  JSON: ".json",
  IMAGE: ".{jpg,png,gif,svg,jpeg,ico}"
} as const;

export const COMMAND = {
  PUG_LINT: "pnpm lint:template"
} as const;
