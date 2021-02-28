const assert = require(`assert`)
const { expect } = require(`chai`)
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

  it(`should have guilds,caches,planets collections by default`, async () => {
    db = mongoose.connection.db

    collections = (await db.listCollections().toArray()).map((c) => c.name)
    expect(collections)
      .to.include.all.members([`guilds`, `caches`, `planets`])

    //   mongoose.connection.db.listCollections().toArray(function (err, names) {
    //     console.log(names); // [{ name: 'dbname.myCollection' }]
    //     module.exports.Collection = names;
    // });
    
    //   expect(res.body)
    // .to.be.an.instanceof(Array)
    // .and.to.have.property(0)
    // .that.includes.all.keys([ 'id', 'category', 'tenant' ])

  // expect(res)
  // .to.have.nested.property('body[0]')
  // .that.includes.all.keys([ 'id', 'category', 'tenant' ])
  })

  
})

after(() => {
  mongoose.disconnect()
  console.log(`Disconnected from mongo`)
})


