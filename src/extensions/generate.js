const { CHARACTERS } = require('../constants')

module.exports.generateCode = (length) => {
    let result = ''
    let characters = CHARACTERS

    let charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters
            .charAt(Math.floor(Math.random() * charactersLength))
            .toUpperCase()
    }
    return result
}