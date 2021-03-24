const mongoose = require(`mongoose`)

// we can do some powerful stuff like validation here, check
// https://mongoosejs.com/docs/schematypes.html

const schemas = {
  Guild: mongoose.Schema(
    {
      _id: { type: String },
      active: { type: Boolean, default: true },
      channel: String,
      created: { type: Number, default: Date.now() },
      faction: { color: String },
      members: [{ userId: String, crewMemberId: String }],
      name: String,
      settings: { prefix: { type: String, default: `.` } },
      shipIds: [String],
    },
    {
      toObject: { virtuals: true },
      toJSON: { virtuals: true },
    },
  ),

  Ship: mongoose.Schema(
    {
      _id: { type: String },
      guildId: String,
      velocity: [Number],
      captain: String,
      cargo: [{ cargoType: String, amount: Number }],
      credits: { type: Number, default: 0 },
      equipment: [
        {
          equipmentType: String,
          list: [{ id: String, repair: Number, repaired: Number }],
        },
      ],
      launched: { type: Number, default: Date.now() },
      location: [{ type: Number, default: 0 }],
      pastLocations: [[Number]],
      name: String,
      power: Number,
      seen: { planets: [String] },
      status: {
        dead: Boolean,
        docked: String,
      },
    },
    {
      toObject: { virtuals: true },
      toJSON: { virtuals: true },
    },
  ),

  User: mongoose.Schema(
    {
      _id: { type: String },
      activeGuild: String,
      memberships: [{ guildId: String, crewMemberId: String }],
    },
    {
      toObject: { virtuals: true },
      toJSON: { virtuals: true },
    },
  ),

  CrewMember: mongoose.Schema(
    {
      _id: { type: String },
      userId: String,
      guildId: String,
      joined: { type: Number, default: Date.now() },
      stamina: Number,
      level: [{ skill: String, level: Number }],
      xp: [{ skill: String, xp: Number }],
    },
    {
      toObject: { virtuals: true },
      toJSON: { virtuals: true },
    },
  ),

  Cache: mongoose.Schema(
    {
      _id: { type: String },
      amount: Number,
      created: Number,
      location: Array,
      type: String,
    },
    {
      toObject: { virtuals: true },
      toJSON: { virtuals: true },
    },
  ),

  AttackRemnant: mongoose.Schema(
    {
      _id: { type: String },
      time: { type: Number, default: Date.now() },
      attacker: {
        name: String,
        shipId: String,
        location: [Number],
      },
      weaponId: String,
      didHit: Boolean,
      damage: Number,
      destroyedShip: Boolean,
      defender: {
        name: String,
        shipId: String,
        location: [Number],
      },
    },
    {
      toObject: { virtuals: true },
      toJSON: { virtuals: true },
    },
  ),

  Planet: mongoose.Schema(
    { _id: { type: String }, name: String },
    {
      toObject: { virtuals: true },
      toJSON: { virtuals: true },
    },
  ),
}

// object.values(schemas).forEach((s) =>
//   s
//     .virtual(`id`)
//     .get(function () {
//       return `${this._id}`
//     })
//     .set(function (id) {
//       this._id = `${id}`
//     }),
// )

const models = {}
Object.keys(schemas).forEach((schemaName) => {
  models[schemaName] = mongoose.model(schemaName, schemas[schemaName])
})

module.exports = models
