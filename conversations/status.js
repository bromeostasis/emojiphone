const phone = require("phone");

const { PHRASES } = require('../utils/constants')
const gameUtils = require('../utils/game_utils');
const turnUtils = require('../utils/turn_utils');

module.exports = {
    STATUS_CONVERSATION: 'status',
    getStatusMessage: async (bot, message) => {
    	const phoneNumber = phone(message.channel)
    	const currentGame = await gameUtils.getLatestGameByPhoneNumber(phoneNumber)

    	if (!currentGame) {
    		return `${PHRASES.NOT_IN_GAME_PHRASE} ${PHRASES.START_PHRASE}`
    	}

    	const currentTurn = await turnUtils.getCurrentTurn(currentGame.id)
    	const numberOfTurnsLeft = await turnUtils.getNumberOfTurnsLeft(currentGame.id)

    	return `It is currently ${currentTurn.user.firstName}'s turn in your game of Emojiphone. There are ${numberOfTurnsLeft} turns left in your game!`
    }
}