module.exports = (guild) => {
  guild.ship.canAttack = () => {
    return (guild.ship.lastAttack || 0) < guild.context.lastTick
  }
}
