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
    shipId: String,
  }),

  Ship: mongoose.Schema({
    bearing: [Number],
    cargo: [{ amount: Number, type: String }],
    credits: { type: Number, default: 0 },
    equipment: {
      type: Map,
      of: [
        {
          id: String,
          repair: { type: Number, default: 1 },
          repaired: { type: Number, default: Date.now() },
        },
      ],
    },
    launched: { type: Number, default: Date.now() },
    location: [{ type: Number, default: 0 }],
    members: [mongoose.Schema.Types.ObjectId],
    name: String,
    power: Number,
    seen: {
      type: Map,
      of: Array,
    },
    speed: Number,
    status: {
      type: Map,
      of: mongoose.Mixed,
    },
  }),

  User: mongoose.Schema({
    _id: { type: String, alias: `id` },
    activeGuild: String,
    memberships: {
      type: Map,
      of: String,
    },
  }),

  GuildMember: mongoose.Schema({
    user: String,
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

const models = {}
Object.keys(schemas).forEach((schemaName) => {
  models[schemaName] = mongoose.model(
    schemaName,
    schemas[schemaName],
  )
})

module.exports = models
