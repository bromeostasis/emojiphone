const gameUtils = require('../utils/game_utils');
const turnUtils = require('../utils/turn_utils');

const NOT_IN_GAME_MESSAGE = `You are not currently playing in a game! Text me the word "start" to begin a new game!` // TODO: Centralize/standardize with other variables

module.exports = {
    STATUS_CONVERSATION: 'status',
    STATUS_KEYWORD: 'status',
    STATUS_PHRASE: `Text "status" for a status update on your game.`,
    getStatusMessage: async (bot, message) => {
    	const phoneNumber = message.channel
    	const currentGame = await gameUtils.getLatestGameByPhoneNumber(phoneNumber)

    	if (!currentGame) {
    		return NOT_IN_GAME_MESSAGE
    	}

    	const currentTurn = await turnUtils.getCurrentTurn(currentGame.id)
    	const numberOfTurnsLeft = await turnUtils.getNumberOfTurnsLeft(currentGame.id)

    	return `It is currently ${currentTurn.user.firstName}'s turn in your game of Emojiphone. There are ${numberOfTurnsLeft} turns left in your game!`
    }
}