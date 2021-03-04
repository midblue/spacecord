const mongoose = require(`mongoose`)

// we can do some powerful stuff like validation here, check
// https://mongoosejs.com/docs/schematypes.html

const schemas = {
  Guild: mongoose.Schema({
    active: { type: Boolean, default: true },
    channel: String,
    created: { type: Number, default: Date.now() },
    faction: { color: String },
    _id: { type: String, alias: `id` },
    name: String,
    settings: { prefix: { type: String, default: `.` } },
    shipIds: [String],
  }),

  Ship: mongoose.Schema({
    bearing: [Number],
    cargo: [mongoose.Mixed],
    credits: { type: Number, default: 0 },
    equipment: { type: mongoose.Mixed },
    launched: { type: Number, default: Date.now() },
    location: [{ type: Number, default: 0 }],
    members: [mongoose.Schema.Types.ObjectId],
    name: String,
    power: Number,
    seen: { planets: [String] },
    speed: Number,
    status: { type: mongoose.Mixed },
  }),

  User: mongoose.Schema({
    _id: { type: String, alias: `id` },
    activeGuild: String,
    memberships: { type: mongoose.Mixed, default: {} },
  }),

  CrewMember: mongoose.Schema({
    userId: String,
    joined: { type: Number, default: Date.now() },
    stamina: Number,
    level: {
      type: Map,
      of: Number,
    },
    xp: {
      type: Map,
      of: Number,
    },
  }),

  Cache: mongoose.Schema({
    amount: Number,
    created: Number,
    location: Array,
    type: String,
  }),

  Planet: mongoose.Schema({ name: String }),
}

schemas.Cache.virtual(`id`)
  .get(function () {
    return this._id
  })
  .set(function (id) {
    this._id = id
  })

const models = {}
Object.keys(schemas).forEach((schemaName) => {
  models[schemaName] = mongoose.model(schemaName, schemas[schemaName])
})

module.exports = models
