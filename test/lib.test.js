const test = require('ava')
const {
  normalizeInputValue,
  isJsFunction,
  getSrcFile,
  uniq,
} = require('../lib')

test('normalizeInputValue non array value', (t) => {
  t.deepEqual(normalizeInputValue('abc'), ['abc'])
})

test('normalizeInputValue array', (t) => {
  t.deepEqual(normalizeInputValue(['abc']), ['abc'])
})

test('normalizeInputValue undefined', (t) => {
  t.deepEqual(normalizeInputValue(undefined), undefined)
})

test('isJsFunction js', (t) => {
  t.true(
    isJsFunction({
      runtime: 'js',
      extension: '.js',
      srcFile: '/index.js',
    })
  )
})

test('isJsFunction png', (t) => {
  t.false(
    isJsFunction({
      runtime: 'js',
      extension: '.png',
      srcFile: '/image.png',
    })
  )
})

test('isJsFunction in node_modules', (t) => {
  t.false(
    isJsFunction({
      runtime: 'js',
      extension: '.js',
      srcFile: '/node_modules/test.js',
    })
  )
})

test('getSrcFile', (t) => {
  t.is(getSrcFile({ srcFile: 'abc' }), 'abc')
})

test('uniq', (t) => {
  t.deepEqual(uniq(['a', 'b', 'a', 'c']), ['a', 'b', 'c'])

  t.deepEqual(uniq(['a', 'b', 'c']), ['a', 'b', 'c'])
})
