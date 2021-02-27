const awaitReaction = require(`./awaitReaction`)

module.exports = (props) => {
  let canceled = { isCanceled: false }
  return {
    cancel: () => {
      canceled.isCanceled = true
    },
    awaitReaction: awaitReaction({ ...props, canceled }),
  }
}
