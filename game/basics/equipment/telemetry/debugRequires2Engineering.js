module.exports = {
  requirements: { engineering: 2 },
  use: () => {
    return {
      image: false,
      map: `test map`,
      model: this.displayName,
      repair: 1,
    }
  },
}
