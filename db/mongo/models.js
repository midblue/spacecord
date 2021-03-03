const mongoose = require(`mongoose`)

const schemas = {
  Guild: mongoose.Schema({
    active: Boolean,
    channel: String,
    created: Number,
    faction: { color: String },
    guildId: String,
    guildName: String,
    settings: { prefix: String },
    shipId: String,
  }),

  Cache: mongoose.Schema({
    amount: Number,
    created: Number,
    location: Array,
    type: String
  }),

  Planet: mongoose.Schema({ name: String })
}

const models = {}
Object.keys(schemas).forEach((schemaName) => {
  models[schemaName] = mongoose.model(schemaName, schemas[schemaName])
})

module.exports = models
