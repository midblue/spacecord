module.exports = {
  bearingToRadians,
  bearingToDegrees,
  bearingToArrow,
  pointIsInsideCircle(centerX, centerY, pointX, pointY, radius) {
    return (
      (pointX - centerX) * (pointX - centerX) +
        (pointY - centerY) * (pointY - centerY) <
      radius * radius
    )
  },
}

function bearingToRadians(bearing) {
  const [x, y] = bearing
  let angle = Math.atan2(y, x)
  return angle
  // let degrees = (180 * angle) / Math.PI //degrees
  // return (360 + Math.round(degrees)) % 360 //round number, avoid decimal fragments
}
function bearingToDegrees(bearing) {
  const angle = bearingToRadians(bearing)
  let degrees = (180 * angle) / Math.PI //degrees
  return (360 + Math.round(degrees)) % 360 //round number, avoid decimal fragments
}
const directionArrows = ['→', '↗', '↑', '↖︎', '←', '↙', '↓', '↘︎']
function bearingToArrow(bearing) {
  const normalizedAngle = bearingToDegrees(bearing) / 360
  const arrayIndex = Math.floor(normalizedAngle * directionArrows.length)
  return directionArrows[arrayIndex]
}
