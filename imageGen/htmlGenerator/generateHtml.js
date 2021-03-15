const fs = require(`fs`)
const rollup = require(`rollup`)
const svelte = require(`rollup-plugin-svelte`)
const rollupResolve = require(`@rollup/plugin-node-resolve`).default
const commonjs = require(`@rollup/plugin-commonjs`)
const svg = require(`rollup-plugin-svg`)
const virtual = require(`@rollup/plugin-virtual`)
const postcss = require(`rollup-plugin-postcss`)
// const { terser } = require(`rollup-plugin-terser`)

module.exports = (templateName = `map`, data = {}) => {
  return new Promise(async (resolve) => {
    const input = `
    import '${__dirname}/src/main.css'
    import App from '${__dirname}/src/${templateName}.svelte'
    const app = new App({
      target: document.body,
      props: ${JSON.stringify(data)}
    })
    export default app`

    const inputOptions = {
      input: `input`,
      plugins: [
        virtual({ input }),
        svelte(),
        rollupResolve({
          browser: true,
          dedupe: (importee) =>
            importee === `svelte` || importee.startsWith(`svelte/`),
          extensions: [`.svelte`, `.mjs`, `.js`, `.json`, `.node`],
        }),
        commonjs(),
        svg(),
        postcss({ extensions: [`.css`] }),
        // terser()
      ],
    }

    const outputOptions = {
      format: `iife`,
      name: `ui`,
    }

    let output
    try {
      const bundle = await rollup.rollup(inputOptions)
      output = (await bundle.generate(outputOptions)).output
    } catch (e) {
      console.log(e)
    }

    const code = output?.[0]?.code
    if (!code) return

    const prependHTML = `<html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
      <script>`
    const appendHTML = `</script>
    </body>
    </html>`
    const finalOutput = prependHTML + code + appendHTML
    resolve(finalOutput)
    fs.writeFile(`${__dirname}/output/test.html`, finalOutput, (e) => {
      if (e) console.log(e)
    })
  })
}
