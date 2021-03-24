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

describe(`Ship Broadcast`, () => {
    it(`should be received by guilds in range when a broadcast is sent`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should not be received by guilds outside of range when a broadcast is sent`, async () => {
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
            path.resolve(`./`, `test/output`, `shipBroadcast.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })

})

