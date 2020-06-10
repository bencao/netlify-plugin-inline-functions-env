# netlify-plugin-inline-functions-env

Inline process.env.X in netlify functions with netlify build time environment variables.

Input

```
console.log(process.env.SITE_NAME);
```

Output

```
console.log("My cool website");
```

## Install

To install, add the following lines to your `netlify.toml` file:

```toml
[[plugins]]
package = "netlify-plugin-inline-functions-env"
```

You can turn on verbose for debugging purpose by providing plugin inputs.

```toml
[[plugins]]
package = "netlify-plugin-inline-functions-env"
  [plugins.inputs]
  verbose = "true"
```

Note: The `[[plugins]]` line is required for each plugin, even if you have other plugins in your `netlify.toml` file already.

Also please add `netlify-plugin-inline-functions-env` to your dev dependencies by `yarn install --dev netlify-plugin-inline-functions-env` or `npm install --save-dev netlify-plugin-inline-functions-env`.
