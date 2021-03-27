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

describe(`Ship Combat`, () => {
    it(`should use ship armor first to mitigate damage taken`,)

    it(`should take equipment damage on being hit by an attack`,)

    it(`should deal cascading damage to other equipment on destroying the first piece`,)

    it(`should take less damage to ship armor than other equipment`,)

    it(`should be possible to target a specific piece of equipment on a ship`,)

    it(`should destroy the ship on its reaching 0 hp`,)

    it(`should spawn an attack remnant on each attack`,)

    before(() => {
        console.log = (...args) => {
            outputToWriteToFile.push(
                args.map((a) => (typeof a === `object` ? JSON.stringify(a, null, 2) : a)),
            )
        }
    })

    after(() => {
        fs.writeFileSync(
            path.resolve(`./`, `test/output`, `shipCombat.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })
})

