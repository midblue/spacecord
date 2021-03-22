const getMaxes = (coordPairs) => {
  let upperBound = coordPairs.reduce((max, p) => Math.max(p[1], max), -99999999)
  let rightBound = coordPairs.reduce((max, p) => Math.max(p[0], max), -99999999)
  let lowerBound = coordPairs.reduce((min, p) => Math.min(p[1], min), 99999999)
  let leftBound = coordPairs.reduce((min, p) => Math.min(p[0], min), 99999999)

  const heightDiff = Math.abs(upperBound - lowerBound)
  const widthDiff = Math.abs(rightBound - leftBound)

  return {
    left: leftBound,
    top: upperBound,
    right: rightBound,
    bottom: lowerBound,
    height: heightDiff,
    width: widthDiff,
  }
}

export default { getMaxes }
