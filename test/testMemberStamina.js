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

describe(`Member Stamina`, () => {
    it(`should passively recharge member stamina`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should not recharge stamina over 100%`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should recharge member stamina faster for members with higher total level`, async () => {
    })

    it(`should raise max stamina with more member levels`, async () => {
    })

    it(`should not be possible to do a stamina-required action without sufficient stamina`, async () => {
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
            path.resolve(`./`, `test/output`, `memberStamina.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })

})
