const test = require('ava')
const fs = require('fs')
const util = require('util')
const sinon = require('sinon')
const { v4: uuidv4 } = require('uuid')
const handler = require('..')

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)
const unlink = util.promisify(fs.unlink)

async function run(content, inputs) {
  const fileName = `${uuidv4()}.txt`

  await writeFile(fileName, content)

  const listAll = sinon
    .stub()
    .returns([{ runtime: 'js', extension: '.js', srcFile: fileName }])

  const utils = {
    functions: { listAll },
    build: { failBuild: console.log },
    status: { show: console.log },
  }

  await handler.processFiles({ inputs, utils })

  const transformedFile = await readFile(fileName, 'utf8')

  await unlink(fileName)

  return transformedFile
}

test('default inputs', async (t) => {
  process.env.VAR_1 = 'foo'
  process.env.VAR_2 = 'bar'

  t.is(
    await run(`() => {process.env.VAR_1;process.env.VAR_2;};`, {}),
    `() => {"foo";"bar";};`
  )
})

test('inputs with include', async (t) => {
  process.env.VAR_1 = 'foo'
  process.env.VAR_2 = 'bar'

  t.is(
    await run(`() => {process.env.VAR_1;process.env.VAR_2;};`, {
      include: ['VAR_1'],
    }),
    `() => {"foo";process.env.VAR_2;};`
  )
})

test('inputs with exclude', async (t) => {
  process.env.VAR_1 = 'foo'
  process.env.VAR_2 = 'bar'

  t.is(
    await run(`() => {process.env.VAR_1;process.env.VAR_2;};`, {
      exclude: ['VAR_1'],
    }),
    `() => {process.env.VAR_1;"bar";};`
  )
})

test('inputs with both include and exclude', async (t) => {
  process.env.VAR_1 = 'foo'
  process.env.VAR_2 = 'bar'

  t.is(
    await run(`() => {process.env.VAR_1;process.env.VAR_2;};`, {
      exclude: ['VAR_1'],
      include: ['VAR_2'],
    }),
    `() => {process.env.VAR_1;"bar";};`
  )
})

test('inputs without buildEvent', async (t) => {
  t.deepEqual(handler({}), { onPreBuild: handler.processFiles })
})

test('inputs with buildEvent', async (t) => {
  t.deepEqual(handler({ buildEvent: 'onBuild' }), {
    onBuild: handler.processFiles,
  })
})
