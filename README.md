# netlify-plugin-inline-functions-env

[![npm version](https://badge.fury.io/js/netlify-plugin-inline-functions-env.svg)](https://badge.fury.io/js/netlify-plugin-inline-functions-env)

Inline process.env.X in netlify functions with netlify build time environment variables.

## Why

When we talk about environment variable values for a netlify function, it is important to understand that there're two possible context.

**Build time**

This is when netlify build your site. The following environment variables would be available at build time:

- Environment Variables you set at Netlify UI
- Environment Variables you set in `netlify.toml` within `[context.deploy-preview.environment]` section
- Environment Variables set by other plugins such as [contextual env plugin](https://github.com/cball/netlify-plugin-contextual-env#readme)

**Runtime**

This is when your function code is evaluated when a request was received. The following environment variables would be available at runtime:

- Environment Variables you set at Netlify UI

**Problem**

You may have noticed from the above sections that for Runtime, the available environment variables is only a subset of that in build time.

That is a common source of confusion for many people, see discussions [here](https://community.netlify.com/t/support-guide-using-environment-variables-on-netlify-correctly/267).

So the plugin was built to mitigate this issue by inlining the build time environment variable values as part of your code.

With original function source file

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

It will produce inlined function source file

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

**Caveats**

The plugin wouldn't replace more dynamic code like the following ones

```
console.log(process.env);          <-------- no concrete values, won't be replaced with an object

function getKey(key) {
  return process.env[key];         <-------- rely on runtime value so won't be replaced
}
```

So you may have to intentionlly convert the above code into something like `process.env.X` so it will be inlined.

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
