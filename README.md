# netlify-plugin-inline-functions-env

[![npm version](https://badge.fury.io/js/netlify-plugin-inline-functions-env.svg)](https://badge.fury.io/js/netlify-plugin-inline-functions-env)

Inline process.env.X in netlify functions with netlify build time environment variables.

Original Function Source File

```
function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      CONTEXT: process.env.CONTEXT
    })
  };
};

module.exports = { handler };
```

Inlined Function Source File

```
function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      CONTEXT: "deploy-preview"    <---------- replaced with build time env var values
    })
  };
};

module.exports = { handler };
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
