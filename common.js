const staminaRequirements = require('./game/basics/crew/staminaRequirements')
const powerRequirements = require('./game/basics/guild/powerRequirements')
// const lunicode = require('Lunicode')
const Filter = require('bad-words'),
  filter = new Filter()
const numberEmojis = [
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
    return numberEmojis[number]
  },
  emojiToNumber(emoji) {
    return numberEmojis.findIndex((e) => e === emoji)
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
    return string
      .split(' ')
      .map(
        (s) => s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase(),
      )
      .join(' ')
  },
  checkUserInputForBadWords(string) {
    const ok = filter.isProfane(string)
    if (!ok) string = filter.clean(string)
    return {
      ok,
      result: string,
      message: ok ? 'ok' : `Sorry, you can't use language like that here.`,
    }
  },
  msToTimeString(ms) {
    let seconds = Math.round((ms % (60 * 1000)) / 1000)
    if (seconds <= 9) seconds = '0' + seconds
    let minutes = Math.round(ms / 1000 / 60)
    return `${minutes}:${seconds}`
  },
  usageTag(power, stamina, credits) {
    let tag = ''
    if (power) tag += powerTag(power)
    if (power && (stamina || credits)) tag += ' '
    if (stamina) tag += staminaTag(stamina)
    if ((power || stamina) && credits) tag += ' '
    if (credits) tag += creditsTag(credits)
    return tag
  },
  garble(string, percent = 0) {
    if (percent > 0.98) percent = 0.98
    let splitString = string.split(' ')
    while (Math.random() < percent)
      arrayMove(
        splitString,
        Math.floor(splitString.length * Math.random()),
        Math.floor(splitString.length * Math.random()),
      )
    if (percent > 0.05)
      splitString = splitString.map((s) => {
        s = s.split('')
        while (Math.random() < percent)
          arrayMove(
            s,
            Math.floor(s.length * Math.random()),
            Math.floor(s.length * Math.random()),
          )
        if (percent > 0.2)
          s = s.map((char) => {
            if (Math.random() < percent / 2)
              char = possibleRandomCharacters.charAt(
                Math.floor(Math.random() * possibleRandomCharacters.length),
              )
            return char
          })
        return s.join('')
      })
    return splitString.join(' ')
  },
  powerTag,
  staminaTag,
  captainTag: '`👩‍✈️Captain`',
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
  if (typeof power === 'string') power = powerRequirements[power]
  return `\`⚡️${power}\``
}
function staminaTag(stamina) {
  if (typeof stamina === 'string') stamina = staminaRequirements[stamina]
  return `\`💪${stamina}\``
}
function creditsTag(credits) {
  return `\`💳${credits}\``
}

function arrayMove(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    const k = new_index - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
}

const possibleRandomCharacters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.,   '
