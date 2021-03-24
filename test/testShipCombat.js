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
    it(`should use ship armor first to mitigate damage taken`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should take equipment damage on being hit by an attack`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should deal cascading damage to other equipment on destroying the first piece`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should take less damage to ship armor than other equipment`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should be possible to target a specific piece of equipment on a ship`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should destroy the ship on its reaching 0 hp`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should spawn an attack remnant on each attack`, async () => {
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
            path.resolve(`./`, `test/output`, `shipCombat.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })
})

