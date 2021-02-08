const maxLogLength = 50
module.exports = (guild) => {
  guild.ship.maxActionRadius = () => {
    return Math.max(guild.ship.attackRadius(), guild.ship.interactRadius)
  }
}
