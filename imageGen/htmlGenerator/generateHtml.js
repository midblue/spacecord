const fs = require(`fs`)
const path = require(`path`)
// const { terser } = require(`rollup-plugin-terser`)

module.exports = (templateName = `map`, data = {}) => {
  return new Promise(async (resolve) => {
    fs.readFile(
      path.resolve(__dirname, `templates`, templateName + `.js`),
      `utf8`,
      (e, templateData) => {
        if (e) {
          console.log(e)
          return resolve()
        }

        const finalOutput = `<html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>
          <script>
            APP_DATA = ${JSON.stringify(data)}
          </script>
          <script>${templateData}</script>
        </body>
        </html>`
        resolve(finalOutput)
        fs.writeFile(`${__dirname}/output/test.html`, finalOutput, (e) => {
          if (e) console.log(e)
        })
      },
    )
  })
}
