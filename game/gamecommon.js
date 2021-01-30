module.exports = {
  log(type = 'Core', ...text) {
    console.log(`> ${type.padEnd(23, ' ')} |`, ...text)
  },
}
