// const lunicode = require('Lunicode')

module.exports = {
  bearingToRadians,
  bearingToDegrees,
  bearingToArrow,
  percentToTextBars(percent, barCount = 10) {
    const bars = []
    for (let i = 0; i < 1; i += 1 / barCount) bars.push(i < percent ? '▓' : '░')
    return '`' + bars.join('') + '`'
  },
  numberToEmoji(number) {
    const emojis = [
      '0️⃣',
      '1️⃣',
      '2️⃣',
      '3️⃣',
      '4️⃣',
      '5️⃣',
      '6️⃣',
      '7️⃣',
      '8️⃣',
      '9️⃣',
      '🔟',
    ]
    return emojis[number]
  },
  pointIsInsideCircle(centerX, centerY, pointX, pointY, radius) {
    return (
      (pointX - centerX) * (pointX - centerX) +
        (pointY - centerY) * (pointY - centerY) <
      radius * radius
    )
  },
  capitalize(string) {
    return (
      string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase()
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
const directionArrows = [
  ':arrow_right:',
  ':arrow_upper_right:',
  ':arrow_up:',
  ':arrow_upper_left:',
  ':arrow_left:',
  ':arrow_lower_left:',
  ':arrow_down:',
  ':arrow_lower_right:',
] //['→', '↗', '↑', '↖︎', '←', '↙', '↓', '↘︎']
function bearingToArrow(bearing) {
  const normalizedAngle = ((bearingToDegrees(bearing) + 45 / 2) % 360) / 360
  const arrayIndex = Math.floor(normalizedAngle * directionArrows.length)
  return directionArrows[arrayIndex]
}
