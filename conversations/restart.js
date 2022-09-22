const phone = require("phone");
const { BotkitConversation } = require('botkit');

const models = require('../models');
const turnUtils = require('../utils/turn_utils');
const setupUtils = require('../utils/setup_utils');
const gameUtils = require('../utils/game_utils');
const utils = require('../utils/utils');
const turnConversation = require('../conversations/turn');
const setupConversation = require('../conversations/setup');
const cancelConversation = require('./cancel');
const statusConversation = require('./status');

const ALREADY_RESTARTED_THREAD = "alreadyRestarted";
const WONT_RESTART_THREAD = "wontRestart";
const DEFAULT_THREAD = 'default';
const NOT_FINISHED_THREAD = 'notFinished';
const NO_GAMES_THREAD = 'noGames';
const COMPLETE_ACTION = 'complete';

const RESTARTED_MESSAGE = `Sit back and relax until it's your turn. ${cancelConversation.CANCEL_PHRASE} ${statusConversation.STATUS_PHRASE}`

module.exports = {
    RESTART_CONVERSATION: 'restart',
    setupRestartConversation: async () => {
        let convo = new BotkitConversation(module.exports.RESTART_CONVERSATION, utils.controller);
        convo.before(DEFAULT_THREAD, async(convo, bot) => {
            await module.exports.setConversationVariables(convo);
        })

        module.exports.addRestartQuestion(convo);

        convo.addMessage({
            text: `Someone else already restarted your game! ${RESTARTED_MESSAGE}`, 
            action: COMPLETE_ACTION
        }, ALREADY_RESTARTED_THREAD);
        
        convo.addMessage({
            text: `Ok, your game won't be restarted.`, 
            action: COMPLETE_ACTION
        }, WONT_RESTART_THREAD);
        
        convo.addMessage({
            text: "Please wait until your game completes before trying to restart it.", 
            action: COMPLETE_ACTION
        }, NOT_FINISHED_THREAD);
        
        convo.addMessage({
            text: `You haven't played any games yet. Text me the word "${setupConversation.INITIATE_GAME_KEYWORD}" to begin your first game!`, 
            action: COMPLETE_ACTION
        }, NO_GAMES_THREAD);
        
        await utils.controller.addDialog(convo);
    },
    setConversationVariables: async (convo) => {
        try {
            let phoneNumber = phone(convo.vars.channel)[0];
            let game = await gameUtils.getLatestGameByPhoneNumber(phoneNumber, true);
            if (!game) {
                return await convo.gotoThread(NO_GAMES_THREAD)
            }

            if (await gameUtils.isGameStillInProgress(game.id)) {
                return await convo.gotoThread(NOT_FINISHED_THREAD)
            }
            await convo.setVar("gameId", game.id);
            let turns = await turnUtils.getAllTurns(game.id);
            let firstNames = turns.map(turn => turn.user.firstName);
            await convo.setVar("firstNames", firstNames.join(', '));
        } catch (e) {
            console.log("ERR", e);
        }
    },
    addRestartQuestion: (convo) => {
        let restartPrompt = "You're about to start a game with the following people: {{vars.firstNames}}. Respond with YES to continue."
        convo.addQuestion(restartPrompt, 
            [{
                pattern: 'yes',
                handler: async function(response, inConvo, bot, full_message) {
                    let game = await models.game.findByPk(inConvo.vars.gameId);
                    if (!game.restarted) {
                        await convo.addAction('complete');
                        await module.exports.restartGame(game);
                    } else {
                        await inConvo.gotoThread(ALREADY_RESTARTED_THREAD);
                    }
                }
            },
            {
                default: true,
                handler: async function(response, inConvo, bot, full_message) {
                    await inConvo.gotoThread(WONT_RESTART_THREAD);
                }
            }], 'none', DEFAULT_THREAD
        );


    },
    restartGame: async (game) => {
        if (!game.restarted) {
            game.update({restarted: true});
            let turnsObject = await setupUtils.setupPreviouslyPlayedGame(game.id);
            let previousTurns = turnsObject.previousTurns;
            let newTurns = turnsObject.newTurns;
            if (Array.isArray(previousTurns) && previousTurns.length > 0 && Array.isArray(newTurns) && newTurns.length > 0) {
                for (let turn of previousTurns) {
                    await utils.bot.startConversationWithUser(turn.user.phoneNumber);
                    await utils.bot.say(`Your game was restarted! ${RESTARTED_MESSAGE}`)
                }
                turnConversation.takeFirstTurn(newTurns[0].gameId);
            } else {
                console.log("New game not successfully created");
            }
        }
    },
}