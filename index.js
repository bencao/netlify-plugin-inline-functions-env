const fs = require('fs')
const babel = require('@babel/core')
const inlinePlugin = require('babel-plugin-transform-inline-environment-variables')

async function inlineEnv(path, options = {}, verbose = false) {
  console.log('inlining', path)

  const transformed = await babel.transformFileAsync(path, {
    plugins: [babel.createConfigItem([inlinePlugin, options])],
    retainLines: true,
  })

  if (verbose) {
    console.log('transformed code', transformed.code)
  }

  await fs.promises.writeFile(path, transformed.code, 'utf8')
}

async function processFiles({ inputs, utils }) {
  const verbose = !!inputs.verbose

  if (verbose) {
    console.log(
      'build env contains the following environment variables',
      Object.keys(process.env)
    )
  }

  const netlifyFunctions = await utils.functions.listAll()
  const files = netlifyFunctions.filter(isJsFunction).map(getSrcFile)

  if (files.length !== 0) {
    try {
      if (verbose) {
        console.log('found function files', files)
      }

      const include = inputs.include && [inputs.include].flat()
      const exclude = inputs.exclude && [inputs.exclude].flat()

      await Promise.all(
        files.map((f) => inlineEnv(f, { include, exclude }, verbose))
      )

      utils.status.show({
        summary: `Processed ${files.length} function file(s).`,
      })
    } catch (err) {
      return utils.build.failBuild(
        `Failed to inline function files due to the following error:\n${err.message}`,
        { error: err }
      )
    }
  } else {
    utils.status.show({
      summary: 'Skipped processing because the project had no functions.',
    })
  }
}

function isJsFunction({ runtime, extension, srcFile }) {
  return (
    runtime === 'js' &&
    extension === '.js' &&
    !srcFile.includes('/node_modules/')
  )
}

function getSrcFile({ srcFile }) {
  return srcFile
}

module.exports = (inputs) => {
  // Use user configured buildEvent
  const buildEvent = inputs.buildEvent || 'onPreBuild'

  return {
    [buildEvent]: processFiles,
  }
}
