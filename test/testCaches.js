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

describe(`Caches`, () => {
    it(`should be able to spawn caches`, async () => {
        await game.spawnCache({
            location: [
                Math.random() * game.gameDiameter() - game.gameDiameter() / 2,
                Math.random() * game.gameDiameter() - game.gameDiameter() / 2,
            ],
            type: `fuel`,
            amount: 1000,
        })

        await game.spawnCache({
            location: [
                3, 3
            ],
            type: `credits`,
            amount: 100,
        })

        chai.expect(game.caches.length).to.equal(2)
        assert(game.caches[0].id)
        chai.expect(game.caches[0].type).to.equal(`fuel`)
        chai.expect(game.caches[0].amount).to.equal(1000)
        assert(game.caches[1].id)
        chai.expect(game.caches[1].type).to.equal(`credits`)
        chai.expect(game.caches[1].amount).to.equal(100)
        chai.expect(game.caches[1].location).to.deep.equal([3, 3])
    })
    it(`should be able to delete caches`, async () => {
        await game.spawnCache({
            location: [0, 0],
            type: `credits`,
            amount: 100,
        })
        chai.expect(game.caches.length).to.equal(3)
        while (game.caches.length)
            await game.deleteCache(game.caches[0].id)

        chai.expect(game.caches).to.deep.equal([])
    })
    it(`should keep caches gone on re-init`, async () => {
        const { db } = require(`../db/mongo/db`)
        await game.init(db)
        chai.expect(game.caches).to.deep.equal([])
    })

    before(async () => {
        try {
            await mongoose.connection.collection(`caches`).drop()
        } catch (e) { }
        game.caches = []

        console.log = (...args) => {
            outputToWriteToFile.push(
                args.map((a) => (typeof a === `object` ? JSON.stringify(a, null, 2) : a)),
            )
        }
    })

    after(() => {
        fs.writeFileSync(
            path.resolve(`./`, `test/output`, `caches.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })
})
