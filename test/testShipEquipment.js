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
const game = require(`../game/manager`)

let outputToWriteToFile = []

describe(`Ship Equipment`, () => {
    it(`should have live properties on ship equipment`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should be possible to sell equipment, and to get credits for selling`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should be possible to buy equipment, and to spend credits on it`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should properly replace singleton items on add`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should properly give new equipment live properties on add`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    before(() => {
        console.log = (...args) => {
            outputToWriteToFile.push(
                args.map((a) => (typeof a === `object` ? JSON.stringify(a, null, 2) : a)),
            )
        }
    })

    after(() => {
        fs.writeFileSync(
            path.resolve(`./`, `test/output`, `shipEquipment.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })
})

