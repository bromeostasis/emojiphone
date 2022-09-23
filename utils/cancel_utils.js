const { PHRASES } = require('../utils/constants')
const models = require('../models');
const utils = require('../utils/utils');

module.exports = {	
    cancelGame: async (game, cancellingUser) => {
        if (!game.completed) {
            const currentTurn = await models.turn.findOne({
                where: {
                    gameId: game.id,
                    isCurrent: true
                },
                include: [
                    {
                        model: models.user,
                        as: "user",
                        attributes: ['phoneNumber']
                    }
                ]
            })

            await clearStoredConversationsFromTurn(currentTurn)

            const numAffectedAndTurns = await models.turn.update({
                isCurrent: false
            }, {
                where: {
                    gameId: game.id
                },
                returning: true
            })
            await game.update({completed: true});

            await sendCancelledGameMessages(numAffectedAndTurns[1], cancellingUser)
        } else {
            console.log('Trying to cancel game that is already completed:', game, cancellingUser)
        }
    },
}

// "Documentation" for postgresStorage comes from a combination of here: https://www.npmjs.com/package/botbuilder-storage-postgres
// And the PostgresStorage.ts file in this library's source code ^^ 😅
const clearStoredConversationsFromTurn = async (turn) => {
    if (turn) {
        const postgresStorageKey = utils.getPostgresStorageKeyFromPhoneNumber(turn.user.phoneNumber)
        const storedConvoInfo = await utils.postgresStorage.read([postgresStorageKey])
        storedConvoInfo[postgresStorageKey].dialogState.dialogStack = []
        await utils.postgresStorage.write(storedConvoInfo)
    } else {
        console.log('Cancelling game where there is no current turn?! Game id:', game.id)
    }
}

const sendCancelledGameMessages = async (turns, cancellingUser) => {
	for (const turn of turns) {
        const user = await models.user.findByPk(turn.userId)
        await utils.bot.startConversationWithUser(user.phoneNumber);
        let cancelledByPhrase = ''
        if (user.id !== cancellingUser.id) {
            cancelledByPhrase = ` by ${cancellingUser.firstName}`
        }
        await utils.bot.say(`Your game was cancelled${cancelledByPhrase}! ${PHRASES.START_PHRASE}`)
    }
}