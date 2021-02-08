const { usageTag, distance } = require('../../../../common')
const attackShip = require('../../../../discord/actions/attackShip')
const runGuildCommand = require('../../../../discord/actions/runGuildCommand')
const staminaRequirements = require('../../crew/staminaRequirements')

module.exports = (guild) => {
  guild.ship.getActionsOnOtherShip = (otherShip) => {
    const actions = []

    const dist = distance(...guild.ship.location, ...otherShip.location)

    if (
      guild.ship.equipment.scanner &&
      guild.ship.equipment.scanner[0] &&
      dist <= guild.ship.equipment.scanner[0].range
    )
      actions.push({
        emoji: '🔍',
        label:
          'Scan Ship ' +
          usageTag(guild.ship.equipment.scanner[0].powerUse, 'scanShip'),
        async action({ user, msg, guild }) {
          await runGuildCommand({
            commandTag: 'scanShip',
            author: user,
            msg,
            props: { otherShip, guild },
          })
        },
      })

    if (dist <= guild.ship.attackRadius())
      actions.push({
        emoji: '⚔️',
        label: 'Start Attack Vote ' + usageTag(0, 'poll'),
        async action({ msg, guild }) {
          attackShip({ msg, guild, otherShip })
        },
      })

    return actions
  }
}
