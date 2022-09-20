const models = require('../models');
const { Op } = require('sequelize');

module.exports = {
    getLastPlayedGameByPhoneNumber: async (phoneNumber) => {
        const lastPlayedTurn = await module.exports.getLastPlayedTurnByPhoneNumber(phoneNumber)

        if (lastPlayedTurn) {
            return await models.game.findByPk(lastPlayedTurn.gameId);
        }
    },
    getCurrentGameByPhoneNumber: async (phoneNumber) => {
        const latestTurn = await module.exports.getLatestTurnByPhoneNumber(phoneNumber)

        // This logic relies on the fact that only one game can be played at a time
        // If we allow multiple active games, this will need to get updated anyways to choose which game to cancel
        const lastPlayedGame = await models.game.findOne({
            where: {
                id: latestTurn.gameId,
                completed: false
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
    getLastPlayedTurnByPhoneNumber: async (phoneNumber) => {
        return await models.turn.findOne({
            where: {
                '$user.phoneNumber$': phoneNumber,
                receivedAt: {[Op.not]: null}
            },
            include: [
                {
                    model: models.user, as: "user",
                    attributes: ['phoneNumber']
                }
            ],
            order: [
                ['receivedAt', 'DESC']
            ]
        })
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
    }
}