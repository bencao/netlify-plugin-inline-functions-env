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

async function inlineEnv(path, verbose = false) {
  console.log("inlining", path);

  const transformed = await babel.transformFileAsync(path, {
    plugins: [babel.createConfigItem(inlinePlugin)],
    retainLines: true
  });

  if (verbose) {
    console.log("transformed code", transformed.code);
  }

  await fs.promises.writeFile(path, transformed.code, "utf8");

  if (verbose) {
    console.log("updated file content", path, await fs.promises.readFile(path));
  }
}

module.exports = {
  onPreBuild: async ({ inputs, netlifyConfig }) => {
    const verbose = !!inputs.verbose;

    if (verbose) {
      console.log("build env", process.env);
    }

    if (netlifyConfig.build && netlifyConfig.build.functions) {
      const files = await findAllJSFiles(netlifyConfig.build.functions);

      if (verbose) {
        console.log("found files", files);
      }

      return Promise.all(files.map(f => inlineEnv(f, verbose)));
    }
  }
};
