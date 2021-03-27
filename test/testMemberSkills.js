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
const { equipment } = require(`../game/basics/equipment/equipment`)
const scanArea = require(`../discord/commands/scanArea`).action

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
    const skillName = `piloting`
    const initial = crewMember.skillLevelDetails(skillName)
    crewMember.addXp(skillName, initial.toNextLevel, true)
    chai
      .expect(crewMember.level.find((l) => l.skill === skillName).level)
      .to.equal(initial.level + 1)
    chai.expect(crewMember.xp[0].xp).to.equal(initial.xp + initial.toNextLevel)
  })

  it(`should be impossible to take a skill-required action if the skill requirement is not met`, async () => {
    const guild = game.guilds[0]
    guild.ship.addPower(1000)
    guild.ship.addPart(equipment.telemetry.debugRequires2Engineering, 0)
    const crewMember = guild.ship.members[0]
    chai
      .expect(crewMember.level.find((l) => l.skill === `engineering`).level)
      .to.equal(1)
    chai
      .expect(crewMember.xp.find((l) => l.skill === `engineering`).xp)
      .to.equal(0)

    const res = await scanArea({
      msg,
      guild,
      authorCrewMemberObject: crewMember,
    })
    assert(!res)
  })

  it(`should be possible to take a skill-required action once the skill requirement is met`, async () => {
    const guild = game.guilds[0]
    const crewMember = guild.ship.members[0]
    crewMember.stamina = 1
    const initial = crewMember.skillLevelDetails(`engineering`)
    crewMember.addXp(`engineering`, initial.toNextLevel, true)
    chai
      .expect(crewMember.level.find((l) => l.skill === `engineering`).level)
      .to.equal(2)

    const res = await scanArea({
      msg,
      guild,
      authorCrewMemberObject: crewMember,
    })
    assert(res === true)
  })

  it(`should add legacy xp when a user takes an action`, async () => {
    const guild = game.guilds[0]
    const crewMember = guild.ship.members[0]
    crewMember.stamina = 1
    const initial = crewMember.skillLevelDetails(`legacy`)
    await scanArea({
      msg,
      guild,
      authorCrewMemberObject: crewMember,
    })
    const final = crewMember.skillLevelDetails(`legacy`)
    chai.expect(final.xp).to.be.greaterThan(initial.xp)
  })

  before(async () => {
    try {
      await mongoose.connection.collection(`guilds`).drop()
    } catch (e) {}
    try {
      await mongoose.connection.collection(`ships`).drop()
    } catch (e) {}
    try {
      await mongoose.connection.collection(`users`).drop()
    } catch (e) {}
    try {
      await mongoose.connection.collection(`crewmembers`).drop()
    } catch (e) {}
    game.guilds = []
    console.log = (...args) => {
      outputToWriteToFile.push(
        args.map((a) =>
          typeof a === `object` ? JSON.stringify(a, null, 2) : a,
        ),
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
