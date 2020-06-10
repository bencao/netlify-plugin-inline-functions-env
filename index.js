const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const inlinePlugin = require("babel-plugin-transform-inline-environment-variables");

async function findAllJSFiles(folder) {
  const names = await fs.promises.readdir(folder);

  const jsFilePaths = await Promise.all(
    names.map(async name => {
      const absPath = path.join(folder, name);

      const f = await fs.promises.stat(absPath);

      if (f.isFile()) {
        if (!name.endsWith(".js")) {
          return null;
        }

        return absPath;
      } else if (f.isDirectory()) {
        if (name === "node_modules") {
          return null;
        }

        return findAllJSFiles(absPath);
      } else {
        // ignore symlinks and others
        return null;
      }
    })
  );

  return jsFilePaths.flat().filter(p => !!p);
}

async function inlineEnv(path) {
  console.log("inlining", path);

  const transformed = await babel.transformFileAsync(path, {
    plugins: [babel.createConfigItem(inlinePlugin)],
    retainLines: true
  });

  await fs.promises.writeFile(path, transformed.code, "utf8");
}

module.exports = {
  onPostBuild: async ({ netlifyConfig }) => {
    if (netlifyConfig.build && netlifyConfig.build.functions) {
      const files = await findAllJSFiles(netlifyConfig.build.functions);

      return Promise.all(files.map(inlineEnv));
    }
  }
};
