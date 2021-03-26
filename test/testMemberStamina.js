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

describe(`Member Stamina`, () => {
  it(`should passively recharge member stamina`, async () => {
    await utils.addShip({})
    const guild = game.guilds[0]
    const crewMember = guild.ship.members[0]
    crewMember.stamina = 0
    const initial = crewMember.stamina
    await game.tick()
    const final = crewMember.stamina
    chai.expect(initial).to.be.lessThan(final)
  })

  it(`should not recharge stamina over 100%`, async () => {
    const guild = game.guilds[0]
    const crewMember = guild.ship.members[0]
    crewMember.stamina = 1
    const initial = crewMember.stamina
    await game.tick()
    const final = crewMember.stamina
    chai.expect(initial).to.equal(final)
  })

  it(`should recharge member stamina faster for members with higher total level`, async () => {
    const guild = game.guilds[0]
    const crewMember = guild.ship.members[0]
    crewMember.stamina = 0
    let initial = crewMember.stamina
    await game.tick()
    initial = (crewMember.stamina - initial) * crewMember.maxStamina()
    crewMember.addXp(`munitions`, 10000, true)
    let final = crewMember.stamina
    await game.tick()
    final = (crewMember.stamina - final) * crewMember.maxStamina()
    chai.expect(initial).to.be.lessThan(final)
  })

  it(`should raise max stamina with more member levels`, async () => {
    const guild = game.guilds[0]
    const crewMember = guild.ship.members[0]
    const initial = crewMember.maxStamina()
    crewMember.addXp(`engineering`, 10000, true)
    crewMember.addXp(`piloting`, 10000, true)
    const final = crewMember.maxStamina()
    chai.expect(initial).to.be.lessThan(final)
  })

  it(`should not be possible to do a stamina-required action without sufficient stamina`, async () => {
    const guild = game.guilds[0]
    guild.ship.power = 1000
    const crewMember = guild.ship.members[0]
    crewMember.stamina = 0
    const eBrake = require(`../discord/commands/eBrake`).action
    const res = await eBrake({
      msg,
      guild,
      authorCrewMemberObject: crewMember,
    })
    assert(!res)
  })

  before(async () => {
    try {
      await mongoose.connection.collection(`guilds`).drop()
      await mongoose.connection.collection(`ships`).drop()
      await mongoose.connection.collection(`users`).drop()
      await mongoose.connection.collection(`crewmembers`).drop()
      game.guilds = []
    } catch (e) {}
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
      path.resolve(`./`, `test/output`, `memberStamina.txt`),
      outputToWriteToFile.join(`\n`),
    )
  })
})
