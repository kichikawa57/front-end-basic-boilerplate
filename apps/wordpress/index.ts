import {
  checkDir,
  log,
  RenderOption,
  renders,
  WatchOption,
  watch
} from '@core';

const env = process.env.NODE_ENV || 'local';

const buildRuns: RenderOption['runs'] = {
  php: true,
  scss: true,
  typescript: true,
  image: true,
  css: true,
  json: true
};

const watchRuns: WatchOption['runs'] = {
  php: true,
  scss: true,
  typescript: true,
  image: true,
  css: true,
  json: true
};

void (async () => {
  switch (env) {
    case 'local': {
      if (!checkDir('./dist')) {
        const { reject } = await renders({
          runs: buildRuns
        });

        if (reject) {
          log('error', `Failed to render all files ${reject.message})`);
          return;
        }

        await watch({
          runs: watchRuns
        });

        return;
      }

      await Promise.all([
        renders({
          runs: buildRuns
        }),
        watch({
          runs: watchRuns
        })
      ]);

      break;
    }

    default: {
      const { reject } = await renders({
        runs: buildRuns
      });

      if (reject) {
        log('error', `Failed to render all files ${reject.message})`);
        return;
      }
    }
  }
})();
