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

describe(`Member Skills`, () => {
    it(`should initialize xp and level numbers properly`, async () => {
        await utils.addShip({})
        const crewMember = await models.CrewMember.findOne({})
        chai.expect(crewMember.xp[0].xp).to.equal(0)
        chai.expect(crewMember.level[0].level).to.equal(1)
    })
    it(`should be possible to level up by adding XP in a skill`, async () => {
        const crewMember = game.guilds[0].ship.members[0]
        console.log(crewMember)
        const skillName = crewMember.xp[0].skill
        const initial = crewMember.skillLevelDetails(skillName)
        crewMember.addXp(skillName, initial.toNextLevel, true)
        chai.expect(crewMember.level.find((l) => l.skill === skillName).level).to.equal(initial.level + 1)
        chai.expect(crewMember.xp[0].xp).to.equal(initial.xp + initial.toNextLevel)
    })

    it(`should be possible to take a skill-required action once the skill requirement is met`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should be impossible to take a skill-required action if the skill requirement is not met`, async () => {
        assert(false, `Tony Kong <(B{|)`)
    })

    it(`should add legacy xp when a user takes an action`, async () => {
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
            path.resolve(`./`, `test/output`, `memberSkills.txt`),
            outputToWriteToFile.join(`\n`),
        )
    })

})
