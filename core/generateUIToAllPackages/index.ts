import { copyFile, getDirsSync } from "../helper/utils";

export const generateUIToAllPackages = async ({
  entries,
  dist,
  ignore
}: {
  entries: string[];
  dist: {
    type: "web" | "wordpress";
    dir: string;
  };
  ignore: string[];
}) => {
  const originalPaths = await getDirsSync(entries, {
    ignore
  });

  const targetPackageDir = `${process.cwd().split("/apps/")[0]}/apps/${dist.type}`;
  const distDir = `${targetPackageDir}/${dist.dir}`;

  const promises = [];

  for (const originalPath of originalPaths.resolve || []) {
    const path = originalPath.replace("src/", "");
    const distPath = `${distDir}/${path}`;

    promises.push(copyFile(originalPath, distPath));
  }

  await Promise.all(promises);
};
