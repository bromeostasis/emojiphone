const { PHRASES } = require('../utils/constants');
const setupUtils = require('../utils/setup_utils');
const utils = require('../utils/utils');
const phone = require("phone");

module.exports = {
	/**
    * Create a game using data from the api (frontend)
    * @param  {Object} body  Request body from frontend
    * @param  {string} body.firstName  First name of the player initiating the game
    * @param  {string} body.lastName  Last name of the player initiating the game
    * @param  {string} body.phoneNumber  Phone number of the player initiating the game
    * @param  {Object[]} body.players  Array of players included in the game. Should be enough to start a game
    * @param  {string} body.players[n].firstName  First name of the nth player to be added
    * @param  {string} body.players[n].lastName  Last name of the nth player to be added
    * @param  {string} body.players[n].phoneNumber  Phone number of the nth player to be added
    */
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

		// TODO: needsOnboarding: false?
		const creatingUser = await setupUtils.createUser({
			firstName,
			lastName,
			phoneNumber: phone(phoneNumber, 'USA')[0],
			needsOnboarding: false,
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

		await utils.bot.startConversationWithUser(phoneNumber);
		await utils.bot.say(PHRASES.START_GAME_FROM_WEB_PHRASE)

		return { status: 200, response: {
			message: 'Game successfully created'
		}}
	}
}