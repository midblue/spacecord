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
