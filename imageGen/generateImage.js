const nodeHtmlToImage = require(`node-html-to-image`)
const generateHtml = require(`./htmlGenerator/generateHtml`)

module.exports = async (templateName = `map`, data = {}) => {
  const html = await generateHtml(templateName, data)
  return await nodeHtmlToImage({
    html,
    type: `png`,
    puppeteerArgs: {
      defaultViewport: { width: 800, height: 800 },
      args: [`--no-sandbox`],
      executablePath: `/usr/bin/chromium-browser`,
    },
    encoding: `buffer`,
  })
}

// // * get all exports from files in this folder
// const fs = require(`fs`)
// const path = require(`path`)
// const templates = {}
// fs.readdir(path.resolve(__dirname, `templates`), (err, files) => {
//   files.forEach((file) => {
//     if (!file.endsWith(`.html`))
//       return
//     fs.readFile(
//       path.resolve(__dirname, `templates`, file),
//       { encoding: `utf8` },
//       (err, data) => {
//         let dataToSave = data

//         // done reading file

//         // swap in imports
//         const importRegex = /<import [^>]*"([^"]*)"[^>]*>/
//         let importMatch = importRegex.exec(dataToSave)
//         try {
//           while (importMatch) {
//             const i = fs.readFileSync(path.resolve(__dirname, `templates`, importMatch[1]), { encoding: `utf8` })
//             dataToSave = dataToSave.replace(importMatch[0], `${i}`)
//             importRegex.lastIndex = 0
//             importMatch = importRegex.exec(dataToSave)
//           }
//         }
//         catch (e) {}

//         // now we swap in the external CSS files instead of links
//         const cssRegex = /<link [^>]*"([^"]*\.css)"[^>]*>/
//         let cssMatch = cssRegex.exec(dataToSave)
//         try {
//           while (cssMatch) {
//             const css = fs.readFileSync(path.resolve(__dirname, `templates`, cssMatch[1]), { encoding: `utf8` })
//             dataToSave = dataToSave.replace(cssMatch[0], `<style>\n${css}\n</style>`)
//             cssRegex.lastIndex = 0
//             cssMatch = cssRegex.exec(dataToSave)
//           }
//         }
//         catch (e) {}
//         // save it
//         templates[file.substring(0, file.length - 5)] = dataToSave
//       })
//   })
// })
