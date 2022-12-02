const setupUtils = require('../utils/setup_utils');
const phone = require("phone");

module.exports = {
	startGame: async (body) => {
		// TODO Validation library?
		if (!body || !body.firstName || !body.phoneNumber || !body.players || body.players.length < (setupUtils.MINIMUM_PLAYER_COUNT - 1)) {
			return { status: 400, response: {
				message: 'Post body missing fields'
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
		})

		if (response === 500) { // TODO: Better error codes / handling?
			return { status: 500, response: {
				message: "Sorry, you've added someone that is already playing in an active game. We currently only support one game at a time (though multi-game support is coming soon!)."
			}}
		}

		return { status: 200, response: {
			message: 'Game successfully created'
		}}
	}
}