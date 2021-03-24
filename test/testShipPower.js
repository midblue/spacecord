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

describe(`Ship Power`, () => {
    it(`should have a total ship max power equivalent to all batteries' capacity combined`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should be possible to charge the batteries`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should not be possible to charge the batteries over 100%`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should not be possible to do power-related activities without power`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should use the proper amount of power on power-related activites`, async () => {
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
            path.resolve(`./`, `test/output`, `shipPower.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })

})

