db.createUser({
  user: `spacecord`,
  pwd: `spacecord123`,
  roles: [
    {
      role: `readWrite`,
      db: `spacecord`
    }
  ]
})

db.createCollection(`guilds`, { capped: false })
db.createCollection(`caches`, { capped: false })
db.createCollection(`planets`, { capped: false })

db.guilds.insert([
  { "guild": 1 },
  { "guild": 2 },
  { "guild": 3 },
  { "guild": 4 },
  { "guild": 5 }
])

db.caches.insert([
  { "cache": 1 },
  { "cache": 2 },
  { "cache": 3 },
  { "cache": 4 },
  { "cache": 5 }
])
