const fs = require(`fs`)
const path = require(`path`)
const assert = require(`assert`)
const chai = require(`chai`)
const mongoose = require(`mongoose`)
const { msg } = require(`./tools/messages`)
const models = require(`../db/mongo/models`)
const chaiAlmost = require(`chai-almost`)
chai.use(chaiAlmost())
const utils = require(`./tools/utils`)

let outputToWriteToFile = []

describe(`Core Loop`, () => {
    it(`should be able to tick the game`, async () => {
        const game = require(`../game/manager`)
        await game.tick()
    })
    it(`should be able to run the medium tick function`, async () => {
        const game = require(`../game/manager`)
        await game.medium()
    })
    it(`should be able to run the slow tick function, which also saves the game`, async () => {
        const game = require(`../game/manager`)
        await game.slow()
    })
    it(`should not break when re-running start`, async () => {
        const game = require(`../game/manager`)
        await game.start()
    })

    // todo test despawning caches and attackRemnants

    before(() => {
        console.log = (...args) => {
            outputToWriteToFile.push(
                args.map((a) => (typeof a === `object` ? JSON.stringify(a, null, 2) : a)),
            )
        }
    })

    after(() => {
        fs.writeFileSync(
            path.resolve(`./`, `test/output`, `coreLoop.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })
})
