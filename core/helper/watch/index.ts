import chalk from "chalk";
import chokidar, { type FSWatcher } from "chokidar";

type Funcs = {
  change: (path: string) => void;
  unlink?: (path: string) => void;
  error?: (path: string) => void;
};

export class Chokidar {
  private watch: FSWatcher;

  constructor(paths: string[]) {
    this.watch = chokidar.watch(paths);
  }

  get getWatch() {
    return this.watch;
  }

  public watcher({ change, unlink, error }: Funcs) {
    this.watch
      .on("change", (path: string) => {
        change(path);
        console.log(
          `${chalk.bgBlue.white.bold(" FILE CHANGED ")} ${chalk.cyan(path)}`
        );
      })
      .on("unlink", async (path: string) => {
        unlink && unlink(path);
        await this.watch.close(); // watchを外す

        console.log(
          `${chalk.bgYellow.black.bold(" WATCHER CLOSED ")} ${chalk.yellow(
            path
          )}`
        );
      })
      .on("error", async (path) => {
        error && error(path as string);
        await this.watch.close(); // watchを外す
        console.log(
          `${chalk.bgRed.white.bold(" ERROR ")} ${chalk.red(
            `An error occurred while watching: ${path}`
          )}`
        );
        process.kill(process.pid, "SIGHUP");
        process.exit(0);
      });
  }
}
