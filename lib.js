function normalizeInputValue(singleOrArrayValue) {
  if (!singleOrArrayValue) {
    return singleOrArrayValue
  } else if (Array.isArray(singleOrArrayValue)) {
    return singleOrArrayValue
  } else {
    return [singleOrArrayValue]
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

function uniq(items) {
  const uniqItems = []

  items.forEach((item) => {
    if (!uniqItems.includes(item)) {
      uniqItems.push(item)
    }
  })

  return uniqItems
}

module.exports = {
  normalizeInputValue,
  isJsFunction,
  getSrcFile,
  uniq,
}
