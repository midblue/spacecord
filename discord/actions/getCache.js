const send = require('./send')
const { log } = require('../botcommon')
const cargo = require('../../game/basics/cargo')

module.exports = async ({ msg, guild, cache }) => {
  log(msg, 'Cache', msg.guild.name)

  if (!cache) return

  if (!guild.context.caches.find((c) => c.id === cache.id)) {
    msg.delete()
    return send(msg, `Ouch! That cache has already been snagged!`)
  }

  // ---------- use cache getter stamina
  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log('no user found in getCache')
  const staminaRes = authorCrewMemberObject.useStamina('cache')
  if (!staminaRes.ok) return send(msg, staminaRes.message)

  const getRes = guild.context.deleteCache(cache.id)
  if (!getRes) return send(msg, getRes.message)
  if (cache.type === 'credits') guild.ship.credits += cache.amount
  else {
    const existingStock = guild.ship.cargo.find((c) => c.type === cache.type)
    if (existingStock) existingStock.amount += cache.amount
    else
      guild.ship.cargo.push({
        type: cargo.type,
        amount: cargo.amount,
        ...cargo[cargo.type],
      })
  }
  guild.saveNewDataToDb()
  msg.delete()
  return send(
    msg,
    `Nice! You picked up ` +
      cache.amount.toFixed(2) +
      (cache.type === 'credits'
        ? ''
        : ' ' + process.env.WEIGHT_UNIT_PLURAL + ' of') +
      ' ' +
      cache.emoji +
      cache.displayName +
      (cache.type === 'credits'
        ? '.'
        : `. Your ship is now carrying ${Math.round(
            (guild.ship.getTotalWeight() / guild.ship.maxWeight) * 100,
          )}% of its maximum capacity.`),
  )
}
