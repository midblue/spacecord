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

describe(`Attack Remnants`, () => {
    it(`should be able to spawn attack remnants`, async () => {
        await game.spawnAttackRemnant({
            didHit: true
        })

        await game.spawnAttackRemnant({
            didHit: false,
            attacker: { name: `Dave` }
        })

        chai.expect(game.attackRemnants.length).to.equal(2)
        assert(game.attackRemnants[0].id)
        chai.expect(game.attackRemnants[0].didHit).to.equal(true)
        assert(game.attackRemnants[1].id)
        chai.expect(game.attackRemnants[1].didHit).to.equal(false)
        chai.expect(game.attackRemnants[1].attacker.name).to.equal(`Dave`)
    })
    it(`should be able to delete attack remnants`, async () => {
        await game.spawnAttackRemnant({
            didHit: true
        })
        chai.expect(game.attackRemnants.length).to.equal(3)
        while (game.attackRemnants.length)
            await game.deleteAttackRemnant(game.attackRemnants[0].id)

        chai.expect(game.attackRemnants).to.deep.equal([])
    })
    it(`should keep attack remnants gone on re-init`, async () => {
        const { db } = require(`../db/mongo/db`)
        await game.init(db)
        chai.expect(game.attackRemnants).to.deep.equal([])
    })

    before(async () => {
        try {
            await mongoose.connection.collection(`attackremnants`).drop()
        } catch (e) { }
        game.attackRemnants = []

        console.log = (...args) => {
            outputToWriteToFile.push(
                args.map((a) => (typeof a === `object` ? JSON.stringify(a, null, 2) : a)),
            )
        }
    })

    after(() => {
        fs.writeFileSync(
            path.resolve(`./`, `test/output`, `attackRemnants.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })
})
