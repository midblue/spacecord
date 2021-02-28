const assert = require(`assert`)
const mongoose = require(`mongoose`)

const hostname = `127.0.0.1`
const port = 27017
const dbName = `spacecord`
const username = encodeURIComponent(`spacecord`)
const password = encodeURIComponent(`spacecord123`)
const uri = `mongodb://${username}:${password}@${hostname}:${port}\
/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`

describe(`Test database interactions`, () => {
  it(`should create a mongoose connection to mongo successfully`, async () => {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    assert(mongoose.connection.readyState === 1) // connected
  })

  it(`Test 2`, () => {
    assert.strictEqual(`This shouldn't fail`, `This shouldn't fail`)
    assert.notStrictEqual(false, `This should fail`)
  })
})

after(() => {
  mongoose.disconnect()
  console.log(`Disconnected from mongo`)
})


