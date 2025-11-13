import type { GlobOptions } from "glob";

export type HtmlOption = {
  entry: string;
  data: { [key: string]: any };
  noSharedItems?: boolean;
  option: GlobOptions;
};

export type ScssOption = {
  entry: string;
  noSharedItems?: boolean;
  option: GlobOptions;
};

export type WatchingScssOption = ScssOption & {
  renderOption?: {
    entry?: string;
    option?: GlobOptions;
  };
};

export type tsOption = {
  entry: string;
  option: GlobOptions;
  noSharedItems?: boolean;
};

export type JsOption = {
  entry: string;
  option: GlobOptions;
};
