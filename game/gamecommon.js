module.exports = {
  log(type = 'Core', ...text) {
    console.log(`> ${type.padEnd(23, ' ')} |`, ...text)
  },
  allSkills: [
    {
      emoji: '👩‍💻',
      name: 'engineering',
    },
    {
      emoji: '🚀',
      name: 'piloting',
    },
    {
      emoji: '🔧',
      name: 'mechanics',
    },
  ],
}
