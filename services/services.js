const setupUtils = require('../utils/setup_utils');
const phone = require("phone");

module.exports = {
	startGame: async (body) => {
		// TODO Validation library?
		if (!body || !body.firstName || !body.phoneNumber ) {
			return { status: 400, response: {
				message: 'Post body missing fields'
			}}
		}

		if (!body.players || body.players.length < (setupUtils.MINIMUM_PLAYER_COUNT - 1)) {
			return { status: 400, response: {
				message: 'Not enough players to start game'
			}}
		}

		const users = []

		const { firstName, lastName, phoneNumber } = body

		const creatingUser = await setupUtils.createUser({
			firstName,
			lastName,
			phoneNumber: phone(phoneNumber, 'USA')[0]
		})

		for (const user of body.players) {
			const { firstName, lastName, phoneNumber } = user
			const dbUser = await setupUtils.createUser({
				firstName,
				lastName,
				phoneNumber: phone(phoneNumber, 'USA')[0]
			})
			users.push(dbUser)
		}

		const response = await setupUtils.startGameIfReady({
			currentUser: creatingUser,
			gameUsers: users,
			gameReady: true,
			fromServer: true,
		})

		if (response?.status === 500) { // TODO: Better error codes / handling?
			return response
		}

		return { status: 200, response: {
			message: 'Game successfully created'
		}}
	}
}