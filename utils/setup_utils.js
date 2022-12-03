const _ = require("underscore");
const { Op } = require('sequelize');

const MessageType = require('../types/message_type');
const models = require('../models');

const utils = require('../utils/utils');
const turnConversation = require('../conversations/turn')

// TODO: Should not be duplicated :( :(
const ERROR_RESPONSE = "Sorry, we encountered an error processing your request. Please try again or contact our support team at TODO.";
const ALREADY_ACTIVE_ERROR = "Sorry, you've added someone that is already playing in an active game. We currently only support one game at a time (though multi-game support is coming soon!).";

module.exports = {
    MINIMUM_PLAYER_COUNT: 2, // TODO: move to env
    INACTIVE_PLAYER_ERROR_CODE: 500,
    /**
    * Setup the game by instantiating users and turns
    * @param  {Object[]} newUsers  List of users from the database that came from the setup conversation
    * @param  {Object[]} existingUsers  List of users already that we know are in the game (usualy just the current user texting the bot)
    */
    setupGame: async (newUsers, existingUsers) => {
        if (!existingUsers) {
            existingUsers = [];
        }
        const allUsers = newUsers.concat(existingUsers)
        const isInActiveGame = await module.exports.areUsersInActiveGame(allUsers)
        if (isInActiveGame) {
            return module.exports.INACTIVE_PLAYER_ERROR_CODE
        }
        return await module.exports.makeTurns(allUsers);
    },

    /**
    * Create game turns given the players involved. Order should be random!
    * @param  {Object[]} dbUsers  List of users (each contained within it's own list of one item) from the database in the Sequelize format
    */
    makeTurns: async (dbUsers) => {
        dbUsers = _.shuffle(dbUsers);
        let isCurrent = true;
        let messageType = MessageType.text;
        let newGame;
        try {
            newGame = await models.game.create({completed: false});
        } catch(e) {
            return new Promise((resolve, reject) => {
                reject("Could not create new game:", e);
            })
        };
        let turnPromises = [];
        for (var i = 0; i < dbUsers.length; i++) {
            nextUserId = null;
            if (i < dbUsers.length - 1) {
                nextUserId = dbUsers[i + 1].id;
            }
            turnPromises.push(module.exports.makeTurn(dbUsers[i], nextUserId, isCurrent, newGame.id, messageType));
            isCurrent = false;
            messageType = null;
        }
        return Promise.all(turnPromises);
    },
    /**
    * Make a single turn in the game
    * @param  {Object} user  User who's turn it is
    * @param  {integer} nextUserId  Id of user who will go after the current user
    * @param  {boolean} isCurrent  Whether this user is first or not (isCurrent = true)
    * @param  {integer} gameId  Identifier for this round of the game
    * @param  {string} messageType  Type of message (emoji, text, or null)
    */
    makeTurn: (user, nextUserId, isCurrent, gameId, messageType) => {
        let turn = {
            userId: user.id,
            isCurrent: isCurrent,
            gameId: gameId,
            nextUserId: nextUserId,
            messageType: messageType
        }
        return models.turn.create(turn);
    },
    /**
    * Restart a completed game using its id
    * @param  {integer} gameId gameId of game to be restarted
    */
    setupPreviouslyPlayedGame: async (gameId) => {
        let previousTurns = await module.exports.getUsersByGameId(gameId);
        let users = previousTurns.map(turn => turn.user);
        let newTurns = await module.exports.setupGame([], users);
        return {previousTurns: previousTurns, newTurns: newTurns}
    },
    /**
    * Get users that were in a completed game (whether they sent a message or not)
    * @param  {integer} gameId gameId of game to be restarted
    */
    getUsersByGameId: async (gameId) => {
        return await models.turn.findAll(
            {
                attributes: [],
                where: {
                    gameId: gameId,
                }, 
                include: [
                    {
                        model: models.user, as: "user"
                    }
                ]
            }
        )
    },
    /**
     * Validate that we are ready to start the game!
     * @param  {Object[]} users  List of "User" objects to include in the game.
     */
    isGameReady: (users) => {
        return Array.isArray(users) && users.length >= module.exports.MINIMUM_PLAYER_COUNT - 1;
    },

    /**
     * Check if a set of users contrains an entry with the given phone number
     * @param  {Object[]} users  List of "User" objects.
     * @param  {String} phoneNumber  Phone number to check
     */
    containsPhoneNumber: (users, phoneNumber) => {
        return users.filter(user => user.phoneNumber == phoneNumber).length > 0
    },

    areUsersInActiveGame: async (users)  => {
        const userIds = users.map((user) => user.id)
        const turns = await models.turn.findAll({
            attributes: ['gameId'],
            where: {
                userId: {[Op.in]: userIds},
            }
        })
        const gameIds = turns.map((turn) => turn.gameId)
        const currentGame = await models.game.findOne({
            where: {
                completed: false,
                id: {[Op.in]: gameIds}
            }
        })

        return (currentGame !== null)

    },

    isUserInActiveGame: async (user)  => {
        return await module.exports.areUsersInActiveGame([user])
    },
    startGameIfReady: async ({ currentUser, channel: phoneNumber, gameReady, gameUsers, fromServer }) => {
        const sendError = (phoneNumber, message) => {
            if (fromServer) {
                return {
                    status: 500, 
                    response: {
                        message
                    },
                }
            }
            return module.exports.sendGameFailedToSetupText(phoneNumber, message)
        } // TODO: Questionable..

        if (gameReady) {
            try {
                if (!currentUser) {
                    currentUser = await utils.getUserByPhoneNumber(phoneNumber);
                }
                await module.exports.sendOnboardingTexts(gameUsers, currentUser)
                let turns = await module.exports.setupGame(gameUsers, [currentUser]);
                if (Array.isArray(turns) && turns.length > 0) {
                    turnConversation.takeFirstTurn(turns[0].gameId);
                } else {
                    if (turns === module.exports.INACTIVE_PLAYER_ERROR_CODE) {
                        return sendError(phoneNumber, ALREADY_ACTIVE_ERROR);
                    } else {
                        return sendError(phoneNumber, ERROR_RESPONSE);
                    }
                }
            } catch (err) {
                console.log(err);
                return sendError(phoneNumber, ERROR_RESPONSE);
            }
        }
    },
    sendOnboardingTexts: async (users, initiatingUser) => {
        users.filter((user) => user.needsOnboarding).forEach(async (user) => {
            const WELCOME_MESSAGE = `Your friend ${initiatingUser.firstName} invited you to a game of Emojiphone! You will receive another text from this phone number when it's your turn!

Learn more here: TODO`
            await utils.bot.startConversationWithUser(user.phoneNumber);
            await utils.bot.say(WELCOME_MESSAGE)
            await models.user.update({needsOnboarding: false}, {where: {id: user.id}})
        })
    },
    sendGameFailedToSetupText: async (phoneNumber, message) => {
        try {
            await utils.bot.startConversationWithUser(phoneNumber);
            await utils.bot.say(message)
        } catch (err) {
            console.log('Error sending message', err);
        }
        
    },
    createUser: async (user) => {
        // TODO: needsOnboarding?
        const returnedUsers = await models.user.upsert(user, {returning: true}).catch(err => {
            console.log(err);
            throw err;
        })
        return returnedUsers[0] // TODO: Validation?
    }
}
