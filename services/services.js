const setupUtils = require('../utils/setup_utils')

module.exports = {
	startGame: async (body) => {
		if (!body || !body.userFirstName || !body.userPhoneNumber || !body.players || body.players.length < setupUtils.MINIMUM_PLAYER_COUNT) {
			return { status: 400, response: {
				message: 'Post body missing fields'
			}}
		}
	}
}