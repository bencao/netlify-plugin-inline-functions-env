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
        // ignore node_modules
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
}

module.exports = {
  onPreBuild: async ({ inputs, utils, netlifyConfig }) => {
    const verbose = !!inputs.verbose;

    if (verbose) {
      console.log(
        "build env contains the following environment variables",
        Object.keys(process.env)
      );
    }

    if (netlifyConfig.build && netlifyConfig.build.functions) {
      try {
        const files = await findAllJSFiles(netlifyConfig.build.functions);

        if (verbose) {
          console.log("found function files", files);
        }

        await Promise.all(files.map(f => inlineEnv(f, verbose)));

        utils.status.show({
          summary: `Processed ${files.length} function file(s).`
        });
      } catch (err) {
        return utils.build.failBuild(
          `Failed to inline function files due to the following error:\n${err.message}`,
          { error: err }
        );
      }
    } else {
      utils.status.show({
        summary: "Skipped processing because the project had no functions."
      });
    }
  }
};
