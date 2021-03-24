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

describe(`Ship Cargo`, () => {
    it(`should be possible to add cargo to a ship`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should be possible to remove cargo from a ship`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should not be possible to remove more cargo from a ship than it is currently carrying`, async () => {
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
            path.resolve(`./`, `test/output`, `shipCargo.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })
})
