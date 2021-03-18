const staminaRequirements = require(`./game/basics/crew/staminaRequirements`)
const powerRequirements = require(`./game/basics/guild/powerRequirements`)
// const lunicode = require('Lunicode')
const Filter = require(`bad-words`)
const filter = new Filter()
const numberEmojis = [
  `0️⃣`,
  `1️⃣`,
  `2️⃣`,
  `3️⃣`,
  `4️⃣`,
  `5️⃣`,
  `6️⃣`,
  `7️⃣`,
  `8️⃣`,
  `9️⃣`,
  `🔟`,
  `🕚`,
  `🕛`,
  `🕐`,
  `🕑`,
  `🕒`,
  `🕓`,
  `🕔`,
  `🕕`,
  `🕖`,
  `🕗`,
  `🕘`,
  `🕙`,
  `🕚`, // 23
]

module.exports = {
  velocityToRadians,
  velocityToDegrees,
  velocityToArrow,
  percentToTextBars(percent, barCount = 10) {
    const bars = []
    for (let i = 0; i < 1; i += 1 / barCount) bars.push(i < percent ? `▓` : `░`)
    return `\`` + bars.join(``) + `\``
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
      .split(` `)
      .map(
        (s) => s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase(),
      )
      .join(` `)
  },
  checkUserInputForBadWords(string) {
    const ok = filter.isProfane(string)
    if (!ok) string = filter.clean(string)
    return {
      ok,
      result: string,
      message: ok ? `ok` : `Sorry, you can't use language like that here.`,
    }
  },
  msToTimeString(ms) {
    let seconds = Math.round((ms % (60 * 1000)) / 1000)
    if (seconds <= 9) seconds = `0` + seconds
    const minutes = Math.floor(ms / 1000 / 60)
    return `${minutes}:${seconds}`
  },
  usageTag(power, stamina, credits) {
    let tag = ``
    if (power) tag += powerTag(power)
    if (power && (stamina || credits)) tag += ` `
    if (stamina) tag += staminaTag(stamina)
    if ((power || stamina) && credits) tag += ` `
    if (credits) tag += creditsTag(credits)
    return tag
  },
  garble(string, percent = 0) {
    if (percent > 0.98) percent = 0.98
    let splitString = string.split(` `)
    while (Math.random() < percent) {
      arrayMove(
        splitString,
        Math.floor(splitString.length * Math.random()),
        Math.floor(splitString.length * Math.random()),
      )
    }
    if (percent > 0.05) {
      splitString = splitString.map((s) => {
        s = s.split(``)
        while (Math.random() < percent) {
          arrayMove(
            s,
            Math.floor(s.length * Math.random()),
            Math.floor(s.length * Math.random()),
          )
        }
        if (percent > 0.2) {
          s = s.map((char) => {
            if (Math.random() < percent / 2) {
              char = possibleRandomCharacters.charAt(
                Math.floor(Math.random() * possibleRandomCharacters.length),
              )
            }
            return char
          })
        }
        return s.join(``)
      })
    }
    return splitString.join(` `)
  },
  powerTag,
  staminaTag,
  captainTag: `\`👩‍✈️Captain\``,
  distance,
  angle,
  getUnitVectorBetween,
  degreesToUnitVector,
  degreesToArrow,
  radiansToDegrees,
  degreesToRadians,
}

function velocityToRadians(velocity) {
  const [x, y] = velocity
  const angle = Math.atan2(y, x)
  return angle
  // let degrees = (180 * angle) / Math.PI //degrees
  // return (360 + Math.round(degrees)) % 360 //round number, avoid decimal fragments
}
function velocityToDegrees(velocity) {
  const angle = velocityToRadians(velocity)
  const degrees = (180 * angle) / Math.PI // degrees
  return (360 + Math.round(degrees)) % 360 // round number, avoid decimal fragments
}
const directionArrows = [
  `:arrow_right:`,
  `:arrow_upper_right:`,
  `:arrow_up:`,
  `:arrow_upper_left:`,
  `:arrow_left:`,
  `:arrow_lower_left:`,
  `:arrow_down:`,
  `:arrow_lower_right:`,
] // ['→', '↗', '↑', '↖︎', '←', '↙', '↓', '↘︎']
function radiansToDegrees(radians) {
  return (180 * radians) / Math.PI
}
function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180
}
function degreesToArrow(angle) {
  const normalizedAngle = ((angle + 45 / 2) % 360) / 360
  const arrayIndex = Math.floor(normalizedAngle * directionArrows.length)
  return directionArrows[arrayIndex]
}
function velocityToArrow(velocity) {
  return degreesToArrow(velocityToDegrees(velocity))
}
function distance(x1, y1, x2, y2) {
  if (typeof x1 === `object` && x1.location) {
    x2 = y1.location[0]
    y2 = y1.location[1]
    y1 = x1.location[1]
    x1 = x1.location[0]
  }
  if (Array.isArray(x1) && Array.isArray(y1)) {
    x2 = y1[0]
    y2 = y1[1]
    y1 = x1[1]
    x1 = x1[0]
  }
  const a = x1 - x2
  const b = y1 - y2
  return Math.sqrt(a * a + b * b)
}
function angle(x1, y1, x2, y2) {
  if (typeof x1 === `object` && x1.location) {
    x2 = y1.location[0]
    y2 = y1.location[1]
    y1 = x1.location[1]
    x1 = x1.location[0]
  }
  if (Array.isArray(x1) && Array.isArray(y1)) {
    x2 = y1[0]
    y2 = y1[1]
    y1 = x1[1]
    x1 = x1[0]
  }
  return ((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 360) % 360
}

function powerTag(power) {
  if (typeof power === `string`) power = powerRequirements[power]
  return `\`⚡️${power}\``
}
function staminaTag(stamina) {
  if (typeof stamina === `string`) stamina = staminaRequirements[stamina]
  return `\`💪${Math.round(stamina * 100) / 100}\``
}
function creditsTag(credits) {
  return `\`💳 ${credits}\``
}

function arrayMove(arr, oldIndex, newIndex) {
  if (newIndex >= arr.length) {
    let k = newIndex - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0])
}

function degreesToUnitVector(degrees) {
  let rad = (Math.PI * degrees) / 180
  let r = 1
  return [r * Math.cos(rad), r * Math.sin(rad)]
}

function getUnitVectorBetween(thisBody, thatBody) {
  const angleBetween = angle(...thatBody.location, ...thisBody.location)
  return degreesToUnitVector(angleBetween)
}

const possibleRandomCharacters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.,   `
