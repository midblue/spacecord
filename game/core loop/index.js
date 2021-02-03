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

    const updates = this.guilds.map(async (guild) => {
      await guild.stepUpdate()
    })
    await Promise.all(updates)
    log('update', `Updated all ${this.guilds.length} ships`)
  },
}
