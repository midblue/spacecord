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
    it(`should use engine durability on thrust`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should use telemetry durability on scan`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should use battery durability on scan`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should use ship scanner durability on ship scan`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should use transceiver durability on broadcast`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should use weapon durability on attack`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should be possible to repair equipment`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should not be possible to repair equipment above 100%`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should not be possible to use equipment that is broken`, async () => {
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

