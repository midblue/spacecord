const game = require(`../../game/manager`)

const Router = require(`koa-router`)
const router = new Router()

router.get(`/game`, async (ctx) => {
  ctx.body = { ...(await game.export()), textScaleMultiplier: 0.6 }
})

module.exports = router
