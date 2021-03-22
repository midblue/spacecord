const Koa = require(`koa`)
const app = new Koa()
const path = require(`path`)

app.use(require(`koa-static`)(__dirname + `/static`))
app.use(
  require(`koa-static`)(
    path.resolve(__dirname, `../imageGen/htmlGenerator/templates/`),
  ),
)

const apiRoutes = require(`./routes/api`)
app.use(apiRoutes.routes())

app.listen(6969)
