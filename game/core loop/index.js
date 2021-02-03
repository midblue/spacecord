const { log } = require('../gamecommon')
const db = require('../../db/db')

module.exports = {
  async start() {
    log('Core', 'STARTING GAME')
    this.lastTick = Date.now()

    setInterval(async () => {
      console.log('')
      log('', '============= NEW GAME STEP =============')
      await this.update()
      log('', '============= END GAME STEP =============')
      console.log('')
    }, process.env.STEP_INTERVAL)
  },

  async update() {
    // * so even though this is in a separate file,
    // * since we spread it into the main game object,
    // * it has access to game object properties, such as this.guilds.
    this.lastTick = Date.now()

    const updates = this.guilds.map((guild) => {
      return new Promise((resolve) => {
        const ship = guild.ship

        // take every-step actions

        const moveRes = ship.move()
        if (!moveRes.ok && moveRes.message) guild.pushToGuild(moveRes.message)

        const eatRes = ship.eat()
        if (!eatRes.ok && eatRes.message) guild.pushToGuild(eatRes.message)

        // mirror relevant changes into DB

        const dbShipData = guild.saveableData().ship
        const updates = {
          'ship.cargo': dbShipData.cargo,
          'ship.location': dbShipData.location,
        }
        if (!moveRes.ok || !eatRes.ok)
          updates['ship.status'] = dbShipData.status

        db.guild.update({
          guildId: guild.guildId,
          updates,
        })

        resolve()
      })
    })
    await Promise.all(updates)
    log('update', `Repositioned all ${this.guilds.length} ships`)
  },
}
