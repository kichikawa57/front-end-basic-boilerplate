import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

import { exec as execProcess } from "child_process";
import { type GlobOptions, glob } from "glob";
import { mkdirp } from "mkdirp";

type TLogType = "success" | "error" | "warning";

export type TResult<T = null, K = null> = {
  ok: boolean;
  err: boolean;
  resolve: T;
  reject: K;
};

export type TResultPromise<T, K> = TResult<T | null, K | null>;

export const ok: <T = null>(value: T) => TResult<T> = <T = null>(value: T) => {
  return {
    ok: true,
    err: false,
    resolve: value,
    reject: null
  };
};

export const err: <T = Error>(value: T) => TResult<null, T> = <T = Error>(
  value: T
) => {
  return {
    ok: false,
    err: true,
    resolve: null,
    reject: value
  };
};

export const log = (type: TLogType, text: string) => {
  switch (type) {
    case "success":
      console.log(chalk.greenBright(`✔︎ ${text}`));
      break;

    case "error":
      console.error(chalk.red(`✖︎ ${text}`));
      break;

    case "warning":
      console.warn(chalk.yellow(`▲ ${text}`));
      break;
  }
};

export const getDirsSync = (path: string | string[], option: GlobOptions) => {
  return new Promise<TResultPromise<string[], Error>>((resolve) => {
    const dirs = glob.sync(path, option);

    resolve(ok(dirs as string[]));
  });
};

export const createDir = async (file: string) => {
  try {
    const made = await mkdirp(path.dirname(file));
    return ok(made || "create");
  } catch (e) {
    return err(new Error("fail to mkdirp"));
  }
};

export const checkDir = (dir: string) => fs.existsSync(path.join(dir));

export const writeFile = <T>(file: string, data: T) => {
  return new Promise<TResultPromise<string, Error>>(async (resolve) => {
    const createDirResult = await createDir(file);

    if (!createDirResult.reject && createDirResult.err) {
      resolve(err(createDirResult.reject));
      return;
    }

    const buf = data as unknown as string;

    fs.writeFile(file, buf, (error: NodeJS.ErrnoException | null) => {
      if (error) {
        resolve(err(error));
        return;
      }

      resolve(ok(file));
    });
  });
};

export const readFile = (entry: string) => {
  return new Promise<TResultPromise<string, Error>>((resolve) => {
    fs.readFile(
      entry,
      "utf-8",
      (error: NodeJS.ErrnoException | null, html: string) => {
        if (error) {
          resolve(err(error));
          return;
        }

        resolve(ok(html));
      }
    );
  });
};

export const createDirSync = (dir: string) => {
  return new Promise<TResultPromise<string, Error>>((resolve) => {
    fs.mkdir(dir, { recursive: true }, (error) => {
      if (error) {
        resolve(err(error));
        return;
      }

      resolve(ok(dir));
    });
  });
};

export const copyFile = (entry: string, outPath: string) => {
  return new Promise<TResultPromise<string, Error>>(async (resolve) => {
    const directoryPath = path.dirname(outPath);

    await createDirSync(directoryPath);

    fs.copyFile(entry, outPath, (error) => {
      if (error) {
        console.log("error", error);
        resolve(err(error));
        return;
      }

      resolve(ok(outPath));
    });
  });
};

export const exec = (command: string) => {
  return new Promise<TResultPromise<string, Error>>((resolve) => {
    execProcess(command, (error, stdout, stderr) => {
      if (error) {
        resolve(err(new Error(stderr)));
        return;
      }

      resolve(ok(stdout));
    });
  });
};
