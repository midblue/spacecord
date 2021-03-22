const fs = require(`fs`)
const path = require(`path`)
const rollup = require(`rollup`)
const svelte = require(`rollup-plugin-svelte`)
const rollupResolve = require(`@rollup/plugin-node-resolve`).default
const commonjs = require(`@rollup/plugin-commonjs`)
const svg = require(`rollup-plugin-svg`)
const virtual = require(`@rollup/plugin-virtual`)
const postcss = require(`rollup-plugin-postcss`)
// const { terser } = require(`rollup-plugin-terser`)

const templateFileNames = fs
  .readdirSync(__dirname + `/src`)
  .filter((path) => path.indexOf(`.svelte`) > 0)
  .map((p) => p.replace(`.svelte`, ``))

go()

async function go() {
  for (let templateName of templateFileNames) {
    const input = `
    import '${__dirname}/src/main.css'
    import App from '${__dirname}/src/${templateName}.svelte'
    const app = new App({
      target: document.body
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

    fs.writeFile(`${__dirname}/templates/${templateName}.js`, code, (e) => {
      if (e) console.log(e)
    })
  }
  console.log(`Built svelte templates`)
}
