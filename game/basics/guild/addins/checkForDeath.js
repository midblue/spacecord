module.exports = (guild) => {
  guild.ship.checkForDeath = () => {
    const dead = guild.ship.currentHp === 0
    if (dead) guild.pushToGuild(`You're dead!`)
    return dead
  }
}
