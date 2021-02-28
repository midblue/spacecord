const assert = require(`assert`)
const { expect } = require(`chai`)
const mongoose = require(`mongoose`)

let db

describe(`Test database interactions`, () => {
  it(`should create a mongoose connection to mongo successfully`, async () => {
    assert(mongoose.connection.readyState === 1) // connected
  })

  it(`should have guilds,caches,planets collections by default`, async () => {
    collections = (await db.listCollections().toArray()).map((c) => c.name)
    expect(collections)
      .to.include.all.members([`guilds`, `caches`, `planets`])
    
    //   expect(res.body)
    // .to.be.an.instanceof(Array)
    // .and.to.have.property(0)
    // .that.includes.all.keys([ 'id', 'category', 'tenant' ])

    // expect(res)
    // .to.have.nested.property('body[0]')
    // .that.includes.all.keys([ 'id', 'category', 'tenant' ])
  })

  it(`should be able to retrieve a test document from guilds`, async () => {
    // db.collection(`guilds`).find().on(`data`, (doc) => {
    //   console.log(doc)
    // })
    // await cursor.forEach(console.dir);
    // console.log((await db.collection(`guilds`).find({})))

    const Guild = mongoose.model(`cache`, {})
    let all = await Guild.find({})
    console.log(all, `all`)

    cursor = await db.collection(`guilds`).find({})

    // const MyModel = mongoose.model('Test', new Schema({ name: String }));
    // const doc = new MyModel();
    // 
    // doc instanceof MyModel; // true
    // doc instanceof mongoose.Model; // true
    // doc instanceof mongoose.Document; // true
    // 
    // const doc = await MyModel.findOne();
    // 
    // doc instanceof MyModel; // true
    // doc instanceof mongoose.Model; // true
    // doc instanceof mongoose.Document; // true
    // 
    // 
    

    expect(cursor)
      .to.contain.members([{ guild: 1 }])
    
  })

})

before(async () => {
  const mongoose = require(`mongoose`)
  const hostname = `127.0.0.1`
  const port = 27017
  const dbName = `spacecord`
  const username = encodeURIComponent(`spacecord`)
  const password = encodeURIComponent(`spacecord123`)
  const uri = `mongodb://${username}:${password}@${hostname}:${port}\
  /${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  db = mongoose.connection.db
})
after(() => {
  mongoose.disconnect()
  console.log(`Disconnected from mongo`)
})


