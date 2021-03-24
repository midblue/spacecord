const send = require(`./send`)
const { log, canEdit } = require(`../botcommon`)
const cargo = require(`../../game/basics/cargo`)

module.exports = async ({ msg, guild, cache }) => {
  log(msg, `Cache`, msg.guild?.name)

  if (!cache) return

  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log(`no user found in getCache`)

  if (!guild.context.caches.find((c) => c.id === cache.id)) {
    if (await canEdit(msg))
      msg.delete().catch((e) => {
        console.trace()
        console.log(e)
      })
    return authorCrewMemberObject.message(
      `Ouch! That cache has already been snagged!`,
    )
  }

  // ---------- use cache getter stamina
  const staminaRes = authorCrewMemberObject.useStamina(`cache`)
  if (!staminaRes.ok) return

  const getRes = await guild.context.deleteCache(cache.id)
  if (!getRes.ok) return authorCrewMemberObject.message(getRes.message)
  if (cache.type === `credits`) guild.ship.credits += cache.amount
  else {
    const existingStock = guild.ship.cargo.find(
      (c) => c.cargoType === cache.type,
    )
    if (existingStock) existingStock.amount += cache.amount
    else {
      guild.ship.cargo.push({
        type: cargo.type,
        amount: cargo.amount,
        ...cargo[cargo.type],
      })
    }
  }
  guild.saveToDb()
  return guild.message(
    `${msg.author.nickname} picked up ` +
    cache.amount.toFixed(2) +
    (cache.type === `credits` ? `` : ` ` + WEIGHT_UNITS + ` of`) +
    ` ` +
    cache.emoji +
    cache.displayName +
    (cache.shipName
      ? ` jettisoned by 🛸${cache.shipName}`
      : `from an unknown origin`) +
    `. ` +
    (cache.message
      ? `\nAs ${msg.author.nickname
      } tractors the cache into your hold, you see that there's a message attached! It says, "${cache.message.emoji + ` ` + cache.message.message
      }"`
      : ``) +
    (cache.type === `credits`
      ? ``
      : `\nYour ship is now carrying ${Math.round(
        (guild.ship.getTotalMass() / guild.ship.maxMass()) * 100,
      )}% of its maximum capacity.`) +
    (guild.ship.isOverburdened()
      ? `\nYou're overburdened! You won't be able to adjust your trajectory until you drop or sell something.`
      : ``),
  )
}
