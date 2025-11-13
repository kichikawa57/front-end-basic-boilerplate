import {
  checkDir,
  log,
  RenderOption,
  renders,
  WatchOption,
  watch
} from '@core';

import { data } from './data';

const env = process.env.NODE_ENV || 'local';

const buildRuns: RenderOption['runs'] = {
  pug: true,
  scss: true,
  typescript: true,
  image: true
};

const watchRuns: WatchOption['runs'] = {
  pug: true,
  scss: true,
  browser: true,
  typescript: true,
  image: true
};

void (async () => {
  switch (env) {
    case 'local': {
      if (!checkDir('./dist')) {
        const { reject } = await renders({
          pugData: data,
          runs: buildRuns
        });

        if (reject) {
          log('error', `Failed to render all files ${reject.message})`);
          return;
        }

        await watch({
          pugData: data,
          runs: watchRuns
        });

        return;
      }

      await Promise.all([
        renders({
          pugData: data,
          runs: buildRuns
        }),
        watch({
          pugData: data,
          runs: watchRuns
        })
      ]);

      break;
    }

    default: {
      const { reject } = await renders({
        pugData: data,
        runs: buildRuns
      });

      if (reject) {
        log('error', `Failed to render all files ${reject.message})`);
        return;
      }
    }
  }
})();
