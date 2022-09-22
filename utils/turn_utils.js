process.env.NODE_ENV = (process.env.NODE_ENV) ? process.env.NODE_ENV :  "development";
require('custom-env').env(true);

const { Op } = require('sequelize');
const emojiRegex = require('emoji-regex');
const emojiReg = emojiRegex();

const MessageType = require('../types/message_type');
const models = require('../models');
const utils = require('../utils/utils');

const textReg = /[a-zA-Z0-9\.\!\+\$\#\@\_\&\-\+\(\)\/\*\"\'\:\;\!\?\~\`\|\•\√\π\÷\×\¶\∆\£\¢\€\¥\^\°\=\{\}\\\]\[\✓\%\<\>\%\/\*\-\+\ç\ß\à\á\â\ä\æ\ã\å\ā\è\é\ē\ê\ë\û\ú\ù\ü\ū\î\ì\ï\í\ī\ó\ø\œ\ō\ô\ö\õ\ò\ñ]+/
const FIRST_TURN_PROMPT = "Welcome to Emojiphone! You are the first player, so all you need to do is respond with a phrase or sentence that is easy to describe with emojis!";

module.exports = {
    RESTART_KEYWORD: 'again',
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
    sendEndGameMessage: async (gameId) => {
        let messageAndPhoneNumbers = await module.exports.getEndGameMessageWithPhoneNumbers(gameId);

        for (let phoneNumber of messageAndPhoneNumbers.phoneNumbers) {
            utils.bot.say({text: messageAndPhoneNumbers.message, channel: phoneNumber}, (err, response) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    },
    getEndGameMessageWithPhoneNumbers: async (gameId, isGroupMessage) => {
        let usersAndMessages = await module.exports.getUsersAndMessagesFromGameId(gameId);

        let message = "";

        if (isGroupMessage) {
            message = `Great game of Emojiphone everyone! I've started a group text where we can discuss everything that went down. Here was our game:
`
        } else {
            message = `Your game of Emojiphone has completed! Here's the full transcript:
`
        }

        let phoneNumbers = [];

        for (let userMessage of usersAndMessages) {
            let user = userMessage.user;
            phoneNumbers.push(user.phoneNumber);
            let name = user.firstName;
            name += (user.lastName) ? " " + user.lastName : "";
            
            message += `
${name}: ${userMessage.message}`
        }

        if (!isGroupMessage) {
            message += `

If you'd like to start a group message to discuss your game, just click one of the following links!

If you'd like to restart your latest game, simply send a message to this number with the word "${module.exports.RESTART_KEYWORD}".`

// Testing weird link theory
// Android: ${process.env.SERVER_URL}/mmsLink/android/${gameId}
// iOS: ${process.env.SERVER_URL}/mmsLink/ios/${gameId}
        }

        return {
            phoneNumbers: phoneNumbers,
            message: message
        };

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
                        attributes: ['firstName', 'lastName', 'phoneNumber']
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
            return `Text your response to the following prompt using ONLY ${currentMessageType}:
${previousTurn.message}`
        }
    }
}