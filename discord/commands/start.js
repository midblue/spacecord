const send = require(`../actions/send`)
const { log } = require(`../botcommon`)

module.exports = {
  tag: `start`,
  public: true,
  admin: true,
  noShip: true,
  documentation: {
    value: `Starts your server out in the game!`,
    emoji: `🏁`,
    category: `settings`,
    priority: 99,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:start)$`, `gi`).exec(content)
  },
  async action({ msg, settings, client, authorIsAdmin }) {
    log(msg, `Start`, msg.guild?.name)

    /*
    introduce the game and how it works
    explain factions
      ask for faction choice
    ask for the okay (from admins only) to make game channels
    once ok is received,
    create game member roles
      member
      captain
    create channel group
      (ship name)
    create channels with cool names and emoji
      Officer's Lounge
          post access to captain and admins
          read access to all
          shows captain-only commands
      Ship Alerts
          read access to all
          post access to none
          anything coming from external ship (attack, scan, broadcast)
      Voting Tribunal
          view access to members only (for @here)
          emoji react access to members
          post access to admins and captain
          all votes come here
      Crew Quarters/Gym
          post access to members
          shows training commands
          all .me and training comes here
      Flight Deck
          post access to members
          shows movement commands, path
          all motion and results come here
      Combat Bay
          post access to members
          all combat commands and alerts come here
      Telemetry Bay
          post access to members
          all area scan, broadcast, and ship scan commands and info come here
      Engine Room
          post access to members
          all repair
      
    set channel descriptions with cool world-building stuff
    set channel view and post permissions
    spawn guild
    spawn ship
    join okayer in as captain
    */
  },
}
