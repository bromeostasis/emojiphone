const setupUtils = require('../utils/setup_utils')

module.exports = {
	startGame: async (body) => {
		// TODO Validation library?
		if (!body || !body.firstName || !body.phoneNumber || !body.players || body.players.length < (setupUtils.MINIMUM_PLAYER_COUNT - 1)) {
			return { status: 400, response: {
				message: 'Post body missing fields'
			}}
		}

		// Make game

		return { status: 200, response: {
			message: 'Game successfully created'
		}}
	}
}