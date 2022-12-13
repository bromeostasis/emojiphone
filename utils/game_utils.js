const models = require('../models');
const { Op } = require('sequelize');

// TODO: This is probably a "different" kind of util. More of a controller/db access file while many of the other
// utils are manipulating/combining data, this is more of just a generalized query file.
module.exports = {
    getLatestGameByPhoneNumber: async (phoneNumber, mustBeCompleted=false) => {
        const latestTurn = await module.exports.getLatestTurnByPhoneNumber(phoneNumber)

        // This logic relies on the fact that only one game can be played at a time
        // If we allow multiple active games, this will need to get updated anyways to choose which game to cancel
        const lastPlayedGame = await models.game.findOne({
            where: {
                id: latestTurn.gameId,
                completed: mustBeCompleted
            }
        })

        if (lastPlayedGame) {
            return lastPlayedGame
        }
        return undefined
    },
    isGameStillInProgress: async (gameId) => {
        let count = await models.turn.count({
            where: {
                gameId: gameId,
                isCurrent: true
            }
        })

        return count != 0
    }, 
    getLatestTurnByPhoneNumber: async (phoneNumber) => {
        return await models.turn.findOne({
            where: {
                '$user.phoneNumber$': phoneNumber,
            },
            include: [
                {
                    model: models.user,
                    as: "user",
                    attributes: ['phoneNumber']
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        })
    },
    getFirstNamesByGameId: async (gameId) => {
        const turns = await models.turn.findAll({
            where: {
                'gameId': gameId,
            },
            include: [
                {
                    model: models.user,
                    as: "user",
                    attributes: ['firstName']
                }
            ]
        })
        return turns.map(turn => turn.user.firstName);
    },
    /**
    * Get users that were in a completed game (whether they sent a message or not)
    * @param  {integer} gameId gameId of game to be restarted
    */
    // TODO: Move to maybe a separate query util
    getUsersViaTurnByGameId: async (gameId) => {
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
}