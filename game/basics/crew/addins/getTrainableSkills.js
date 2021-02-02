const story = require('../../story/story')
const { log, allSkills } = require('../../../gamecommon')

module.exports = (member) => {
  member.getTrainableSkills = async () => {
    const trainableSkills = [...allSkills]
    return trainableSkills
  }
}
