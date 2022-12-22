process.env.NODE_ENV = (process.env.NODE_ENV) ? process.env.NODE_ENV :  "development";
require('custom-env').env(true);

const { Op } = require('sequelize');
const emojiRegex = require('emoji-regex');
const emojiReg = emojiRegex();

const { GAME_NAME, KEYWORDS } = require('../utils/constants')
const MessageType = require('../types/message_type');
const models = require('../models');
const utils = require('../utils/utils');
const gameUtils = require('../utils/game_utils');

const textReg = /[a-zA-Z0-9\.\!\+\$\#\@\_\&\-\+\(\)\/\*\"\'\:\;\!\?\~\`\|\•\√\π\÷\×\¶\∆\£\¢\€\¥\^\°\=\{\}\\\]\[\✓\%\<\>\%\/\*\-\+\ç\ß\à\á\â\ä\æ\ã\å\ā\è\é\ē\ê\ë\û\ú\ù\ü\ū\î\ì\ï\í\ī\ó\ø\œ\ō\ô\ö\õ\ò\ñ]+/
const FIRST_TURN_PROMPT = `You are the first player, so all you need to do is respond to this text with a phrase or sentence that is easy to describe with emojis!`;

module.exports = {
    isValidResponse: (response, messageType) => {
        response = response.replace(/\s+/g, '');
        if (messageType == MessageType.text) {
            return !emojiReg.test(response);
        }
        else if (messageType == MessageType.emoji) {
            return !textReg.test(response);
        }
        return false;
    },
    oppositeMessageType: (messageType) => {
        if (messageType == MessageType.text) {
            return MessageType.emoji;
        } else {
            return MessageType.text;
        }
    },
    getCurrentTurn: async (gameId) => {
        return await models.turn.findOne({where: {gameId: gameId, isCurrent: true}, include: [{model: models.user, as: "user"}]})
    },
    getPreviousTurn: async (currentTurn) => {
        return await models.turn.findOne({where: {gameId: currentTurn.gameId, nextUserId: currentTurn.userId}})
    },
    getNumberOfTurnsLeft: async (gameId) => {
        return await models.turn.count({where: {gameId: gameId, receivedAt: null}})
    },
    getAllTurns: async (gameId) => {
        return await models.turn.findAll(
            {
                where: {
                    gameId: gameId,
                }, 
                include: [
                    {
                        model: models.user, as: "user",
                        attributes: ['firstName', 'lastName', 'phoneNumber']
                    }
                ],
            }
        )
    },
    sendEndGameMessages: async (gameId) => {
        let turnsWithUsers = await gameUtils.getUsersViaTurnByGameId(gameId)

        for (let turnWithUser of turnsWithUsers) {
            try {
                const endGameMessage = module.exports.getEndGameMessage(gameId, turnWithUser.user.id)
                await utils.bot.startConversationWithUser(turnWithUser.user.phoneNumber)
                await utils.bot.say(endGameMessage)
            }
            catch (err) {
                console.log(err)
            };
        }
    },
    getEndGameMessage: (gameId, userId) => {
        return `Your game of ${GAME_NAME} has completed! To see the results and start a group message to discuss your game, just click one of the following links!

Android: ${process.env.SERVER_URL}/mmsLink/android/${gameId}?userId=${userId}
iOS: ${process.env.SERVER_URL}/mmsLink/ios/${gameId}?userId=${userId}

If you'd like to restart your latest game, simply send a message to this number with the word "${KEYWORDS.RESTART_KEYWORD}".`
    },
    // Prob move to game utils.. And test those succahs
    getUsersAndMessagesFromGameId: async (gameId) => {
        return await models.turn.findAll(
            {
                attributes: ['message'],
                where: {
                    gameId: gameId,
                    message: {[Op.not]: null}
                }, 
                include: [
                    {
                        model: models.user, as: "user",
                        attributes: ['firstName', 'lastName', 'phoneNumber', 'id']
                    }
                ],
                order: [
                    ['receivedAt', 'ASC']
                ]
            }
        )
    },
    makeTurnPrompt: (previousTurn, currentMessageType) => {
        if (!previousTurn) {
            return FIRST_TURN_PROMPT;
        } else {
            return `Respond to this text by translating the following message into ONLY ${currentMessageType}:
${previousTurn.message}`
        }
    }
}