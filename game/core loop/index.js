const constants = require('../basics/constants')
const { log } = require('../gamecommon')
const { bearingToRadians } = require('../../common')

module.exports = {
  async start() {
    log('Core', 'STARTING GAME')
    this.lastTick = Date.now()

    setInterval(async () => {
      console.log('')
      log('', '============= NEW GAME STEP =============')
      await this.update()
      log('', '============= END GAME STEP =============')
    }, constants.STEP_INTERVAL)
  },

  async update() {
    // * so even though this is in a separate file,
    // * since we spread it into the main game object,
    // * it has access to game object properties, such as this.guilds.
    this.lastTick = Date.now()

    const repositions = this.guilds.map((guild) => {
      return new Promise((resolve) => {
        const currentLocation = [...guild.ship.location]
        const currentBearing = bearingToRadians(guild.ship.bearing)
        const currentStepFuelLoss = (guild.ship.equipment.engine || []).reduce(
          (total, engine) => {
            return total + engine.fuelUse * guild.ship.speed
          },
          0,
        )
        const newX =
          currentLocation[0] + guild.ship.speed * Math.cos(currentBearing)
        const newY =
          currentLocation[1] + guild.ship.speed * Math.sin(currentBearing)
        guild.ship.location = [newX, newY]
        const fuel = guild.ship.cargo.find((c) => c.type === 'fuel')
        if (fuel) fuel.amount -= currentStepFuelLoss

        if (!process.env.DEV) guild.pushStatusUpdate()
        resolve()
      })
    })
    await Promise.all(repositions)
    log('update', `Repositioned all ${this.guilds.length} ships`)
  },
}
