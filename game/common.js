module.exports = {
  log(type = 'Core', ...text) {
    console.log(
      // `(${new Date().toLocaleTimeString('en-US', {
      //   hour12: false,
      //   hour: '2-digit',
      //   minute: '2-digit',
      //   second: '2-digit',
      // })})`,
      `${type.padEnd(12, ' ')} |`,
      ...text,
    )
  },
}
