const test = require('ava')
const fs = require('fs')
const util = require('util')
const sinon = require('sinon')
const { v4: uuidv4 } = require('uuid')
const handler = require('..')

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)
const unlink = util.promisify(fs.unlink)

async function run(content, inputs, otherOptions = {}) {
  const fileName = `${uuidv4()}.txt`

  await writeFile(fileName, content)

  const listAll = sinon
    .stub()
    .returns([{ runtime: 'js', extension: '.js', srcFile: fileName }])

  const utils = otherOptions.mockUtils
    ? otherOptions.mockUtils(fileName)
    : {
        functions: { listAll },
        build: { failBuild: console.log },
        status: { show: console.log },
      }

  const returnCode = await handler.processFiles({ inputs, utils })

  const transformedFileContent = await readFile(fileName, 'utf8')

  await unlink(fileName)

  return {
    returnCode,
    transformedFileContent,
  }
}

test('empty file', async (t) => {
  t.is((await run('', {})).transformedFileContent, '')
})

test('default inputs', async (t) => {
  process.env.VAR_1 = 'foo'
  process.env.VAR_2 = 'bar'

  t.is(
    (await run(`() => {process.env.VAR_1;process.env.VAR_2;};`, {}))
      .transformedFileContent,
    `() => {"foo";"bar";};`
  )
})

test('inputs with include', async (t) => {
  process.env.VAR_1 = 'foo'
  process.env.VAR_2 = 'bar'

  t.is(
    (
      await run(`() => {process.env.VAR_1;process.env.VAR_2;};`, {
        include: ['VAR_1'],
      })
    ).transformedFileContent,
    `() => {"foo";process.env.VAR_2;};`
  )
})

test('inputs with exclude', async (t) => {
  process.env.VAR_1 = 'foo'
  process.env.VAR_2 = 'bar'

  t.is(
    (
      await run(`() => {process.env.VAR_1;process.env.VAR_2;};`, {
        exclude: ['VAR_1'],
      })
    ).transformedFileContent,
    `() => {process.env.VAR_1;"bar";};`
  )
})

test('inputs with both include and exclude', async (t) => {
  process.env.VAR_1 = 'foo'
  process.env.VAR_2 = 'bar'

  t.is(
    (
      await run(`() => {process.env.VAR_1;process.env.VAR_2;};`, {
        exclude: ['VAR_1'],
        include: ['VAR_2'],
      })
    ).transformedFileContent,
    `() => {process.env.VAR_1;"bar";};`
  )
})

test('function folder missing', async (t) => {
  const failBuild = sinon.stub().returns(1)
  const listAll = sinon.stub().throws()

  const mockUtils = (fileName) => ({
    functions: { listAll },
    build: { failBuild },
    status: { show: console.log },
  })

  t.is((await run('', {}, { mockUtils })).returnCode, 1)
  t.is(failBuild.callCount, 1)
})

test('inputs without buildEvent', async (t) => {
  t.deepEqual(handler({}), { onPreBuild: handler.processFiles })
})

test('inputs with buildEvent', async (t) => {
  t.deepEqual(handler({ buildEvent: 'onBuild' }), {
    onBuild: handler.processFiles,
  })
})
