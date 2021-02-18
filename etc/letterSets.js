const fs = require(`fs`)
const words = fs.readFileSync(`./words.txt`, { encoding: `utf8` })
  .toLowerCase().split(`\n`)

const sets = []

while (sets.length < 300) {
  const letterSet = []
  while (letterSet.length < 10) {
    letterSet.push(getRandomLetterAdjusted())
  }

  const possibleWords = []
  let longWords = 0
  for (let word of words) {
    if (canBeSpelledWithLetters(word, letterSet)) {
      if (word.length > 4)
        longWords++
      else if (word.length > 3)
        longWords += 0.2
      possibleWords.push(word)
    }
  }

  if (longWords > 4 && possibleWords.length < 30 && possibleWords.length > 10)
    sets.push({ letterSet, possibleWords })
}

fs.writeFileSync(`./wordSets.json`, JSON.stringify(sets, null, 2))

function canBeSpelledWithLetters (word, letters) {
  const remainingLetters = [...letters]
  for (let letter of word.split(``)) {
    const i = remainingLetters.indexOf(letter)
    if (i !== -1)
      remainingLetters.splice(i, 1)
    else
      return
  }
  return true
}
\
function getRandomLetterAdjusted () {
  const alphabet = `bcdfghjklmnpqrstvwxzaeiouyaeiouy`
  return alphabet[Math.floor(Math.random() * alphabet.length)]

}
