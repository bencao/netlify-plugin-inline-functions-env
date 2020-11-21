# netlify-plugin-inline-functions-env

[![npm version](https://badge.fury.io/js/netlify-plugin-inline-functions-env.svg)](https://badge.fury.io/js/netlify-plugin-inline-functions-env)

[![test status](https://github.com/bencao/netlify-plugin-inline-functions-env/workflows/UnitTest/badge.svg)](https://github.com/bencao/netlify-plugin-inline-functions-env/actions)

Inline process.env.X in netlify functions with netlify build time environment variables.

## Why

When we talk about environment variable values for a netlify function, it is important to understand that there're two possible context.

**Build time**

This is when netlify builds your site. The following environment variables would be available at build time:

- Environment Variables you set at Netlify UI
- [Readonly Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/#read-only-variables) set by Netlify including build/git metadata
- [Deploy Context Environment Variables](https://docs.netlify.com/configure-builds/file-based-configuration/#deploy-contexts) you set in `netlify.toml` within `[context.xxx.environment]` section
- Environment Variables set by other Netlify build plugins such as [contextual env plugin](https://github.com/cball/netlify-plugin-contextual-env#readme)

**Runtime**

This is when your function code is evaluated when a request was received. The following environment variables would be available at runtime:

- Environment Variables you set at Netlify UI

**Problem**

You may have noticed that the available environment variables at Runtime is only a subset of that in build time.

That is a common source of confusion for many people, see discussions over [here](https://community.netlify.com/t/support-guide-using-environment-variables-on-netlify-correctly/267).

This plugin was built to mitigate this issue by inlining the build time environment variable values as part of your code, so that you can consider build time environment variables magically become available for runtime!

With the original function source file

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

The plugin will produce the inlined function source file

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

## More Options

### Debugging

You can turn on verbose for debugging purpose by providing plugin inputs.

```toml
[[plugins]]
package = "netlify-plugin-inline-functions-env"
  [plugins.inputs]
  verbose = "true"
```

> Be careful with verbose mode, as it will print the files with the replaced env variables

### Configuring build event

If you are using TypeScript, or processing your code in other ways you may want to choose `onBuild`

```toml
[[plugins]]
package = "netlify-plugin-inline-functions-env"
  [plugins.inputs]
  buildEvent = "onBuild"
```

Default value is `onPreBuild`. It's also been tested to work with `onBuild`
The values for buildEvent can be found [here](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#plug-in-to-build-events)

### Conditional Transformation

If you are using libraries such as [dotenv-defaults](https://github.com/mrsteele/dotenv-defaults), you may want to limit or skip the transformation for certain environment variables.

```toml
[[plugins]]
package = "netlify-plugin-inline-functions-env"
  [plugins.inputs]
  exclude = ["DO_NOT_TRANSFORM_ME", "DO_NOT_TRANSFORM_ME_2"]
```

```toml
[[plugins]]
package = "netlify-plugin-inline-functions-env"
  [plugins.inputs]
  include = ["ONLY_TRANSFORM_ME", "ONLY_TRANSFORM_ME_2"]
```

## Gotchas

1. The `[[plugins]]` line is required for each plugin, even if you have other plugins in your `netlify.toml` file already.

2. This plugin only replaces variables in the functions directory. Files outside the directory won't be modified.

3. Also please add `netlify-plugin-inline-functions-env` to your dev dependencies by `yarn install --dev netlify-plugin-inline-functions-env` or `npm install --save-dev netlify-plugin-inline-functions-env`.
