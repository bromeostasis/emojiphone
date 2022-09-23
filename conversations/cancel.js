const phone = require("phone");
const { BotkitConversation } = require('botkit');

const { MESSAGES } = require('../utils/constants')
const gameUtils = require('../utils/game_utils');
const utils = require('../utils/utils');
const cancelUtils = require('../utils/cancel_utils');
const models = require('../models');

const DEFAULT_THREAD = 'default'
const WONT_CANCEL_THREAD = 'wontCancel'
const NO_ACTIVE_GAMES_THREAD = 'noGames'
const ALREADY_CANCELED_THREAD = 'alreadyCancelled'
const COMPLETE_ACTION = 'complete';

module.exports = {
    CANCEL_CONVERSATION: 'cancel',
    setupCancelConversation: async () => {
        let convo = new BotkitConversation(module.exports.CANCEL_CONVERSATION, utils.controller);
        convo.before(DEFAULT_THREAD, async(convo, bot) => {
            await module.exports.setConversationVariables(convo);
        })

        module.exports.addCancelQuestion(convo);
        
        convo.addMessage({
            text: `Ok, your game won't be finished.`, 
            action: COMPLETE_ACTION
        }, WONT_CANCEL_THREAD);

        convo.addMessage({
            text: 'Your game has already been finished, no need to do anything else!', 
            action: COMPLETE_ACTION
        }, ALREADY_CANCELED_THREAD);
        
        convo.addMessage({
            text: MESSAGES.NOT_IN_GAME_MESSAGE,
            action: COMPLETE_ACTION
        }, NO_ACTIVE_GAMES_THREAD);
        
        await utils.controller.addDialog(convo);
    },
    setConversationVariables: async (convo) => {
        try {
            const phoneNumber = phone(convo.vars.channel)[0];
            const game = await gameUtils.getLatestGameByPhoneNumber(phoneNumber);
            if (!game) {
                return await convo.gotoThread(NO_ACTIVE_GAMES_THREAD)
            }

            const user = await utils.getUserByPhoneNumber(phoneNumber);
            await convo.setVar("user", user)

            await convo.setVar("gameId", game.id);
            const firstNames = await gameUtils.getFirstNamesByGameId(game.id);
            await convo.setVar("firstNames", firstNames.join(', '));
        } catch (e) {
            console.log("ERR", e);
        }
    },
    addCancelQuestion: (convo) => {
        let cancelPrompt = `You're about to finish your game with the following people: {{vars.firstNames}}. Are you sure you want to do this? Respond with "Yes" to confirm cancellation or "No" to allow the game to continue.`
        convo.addQuestion(cancelPrompt, 
            [{
                pattern: 'yes',
                handler: async function(response, inConvo, bot, full_message) {
                    let game = await models.game.findByPk(inConvo.vars.gameId);
                    if (!game.completed) {
                        await cancelUtils.cancelGame(game, inConvo.vars.user);
                        await convo.addAction('complete');
                    } else {
                        await inConvo.gotoThread(ALREADY_CANCELED_THREAD);
                    }
                }
            },
            {
                default: true,
                handler: async function(response, inConvo, bot, full_message) {
                    await inConvo.gotoThread(WONT_CANCEL_THREAD);
                }
            }], 'none', DEFAULT_THREAD
        );


    },
}