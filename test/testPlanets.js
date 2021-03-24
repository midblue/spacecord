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

describe(`Planets`, () => {
    it(`should have the planets with live values in the game`, async () => {
        const origin = game.planets.find((p) => p.name === `Origin`)
        chai.expect(origin.location).to.deep.equal([0, 0])
        chai.expect(origin.context).to.equal(game)
        chai.expect(origin.getSizeDescriptor()).to.equal(`normal-sized`)
        assert(Array.isArray(origin.getDockedShips()))
        chai.expect(origin.saveableData()).to.be.an(`object`)

        const hera = game.planets.find((p) => p.name === `Hera`)
        assert(hera)
    })

    before(async () => {
        const { db } = require(`../db/mongo/db`)
        await game.init(db)

        console.log = (...args) => {
            outputToWriteToFile.push(
                args.map((a) => (typeof a === `object` ? JSON.stringify(a, null, 2) : a)),
            )
        }
    })

    after(() => {
        fs.writeFileSync(
            path.resolve(`./`, `test/output`, `planets.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })
})
