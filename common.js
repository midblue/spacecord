const staminaRequirements = require('./game/basics/crew/staminaRequirements')
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
      '🕚',
      '🕛',
      '🕐',
      '🕑',
      '🕒',
      '🕓',
      '🕔',
      '🕕',
      '🕖',
      '🕗',
      '🕘',
      '🕙',
      '🕚', //23
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
  positionAndAngleDifference(x1, y1, x2, y2) {
    const d = distance(x1, y1, x2, y2)
    const a = angle(x1, y1, x2, y2)
    return { distance: d, angle: a }
  },
  capitalize(string) {
    return (
      string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase()
    )
  },
  checkForHateSpeech(string) {
    // todo
    return { ok: true }
  },
  msToTimeString(ms) {
    let seconds = Math.floor((ms % (60 * 1000)) / 1000)
    if (seconds <= 9) seconds = '0' + seconds
    let minutes = Math.floor(ms / 1000 / 60)
    return `${minutes}:${seconds}`
  },
  usageTag(power, stamina) {
    let tag = ''
    if (power) tag += powerTag(power)
    if (power && stamina) tag += ' '
    if (stamina) tag += staminaTag(stamina)
    return tag
  },
  powerTag,
  staminaTag,
  distance,
  angle,
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
function distance(x1, y1, x2, y2) {
  const a = x1 - x2
  const b = y1 - y2
  return Math.sqrt(a * a + b * b)
}
function angle(x1, y1, x2, y2) {
  return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
}

function powerTag(power) {
  return `\`⚡️${power}\``
}
function staminaTag(stamina) {
  if (typeof stamina == 'string') stamina = staminaRequirements[stamina]
  return `\`💪${stamina}\``
}
