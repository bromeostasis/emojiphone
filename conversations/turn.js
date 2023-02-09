const { BotkitConversation } = require('botkit');
const phone = require("phone");

const { GAME_NAME, PHRASES } = require('../utils/constants')
const utils = require('../utils/utils');
const turnUtils = require('../utils/turn_utils');
const models = require('../models');
const MessageType = require('../types/message_type');

const TURN_CONVERSATION = 'turn';
const TURN_SUCCESS_THREAD = "success";
const TURN_FAIL_THREAD = "fail";
const TURN_THREAD = "turn";
const TURN_ERROR_THREAD = "error";
const DEFAULT_THREAD = 'default';
const COMPLETE_ACTION = 'complete';

module.exports = {
    /**
     * Create the converstaion template where a user takes their turn
     */
    setupTurnConversation: async () => {
        let convo = new BotkitConversation(TURN_CONVERSATION, utils.controller);
        convo.before(DEFAULT_THREAD, async (inConvo, bot) => {
            await module.exports.setConversationVariables(inConvo);
        });

        convo.addMessage({text: `Time to take your turn in your game of ${GAME_NAME}!`, action: TURN_THREAD}, DEFAULT_THREAD);

        convo.addMessage({
            text: `Sorry your response was not written in ONLY {{vars.currentMessageType}}. Please try again!`,
            action: TURN_THREAD
        }, TURN_FAIL_THREAD);

        convo.addMessage({
            text: "Sorry, we encountered an error processing your turn. Please wait a moment and try again.",
            action: COMPLETE_ACTION
        }, TURN_ERROR_THREAD)

        convo.addMessage({text: `Thanks, your turn has been recorded 📝💯🎉 {{vars.nextTurnMessage}}`, action: COMPLETE_ACTION}, TURN_SUCCESS_THREAD);

        module.exports.addTurnQuestion(convo);
        convo.after(async (results, bot) => {
            if (results.currentTurn.nextUserId != null) {
                module.exports.beginNextTurn(results.currentTurn);
            } else {
                await models.game.update({completed: true}, {where: {id: results.currentTurn.gameId}})
                turnUtils.sendEndGameMessages(results.currentTurn.gameId);
            }
        })
        await utils.controller.addDialog(convo);
    },

    /**
     * Set up the variables that allow each conversation to be unique
     * @param  {object} convo  Botkit conversation that can ask questions
     */
    setConversationVariables: async (convo) => {
        let previousTurn = await turnUtils.getPreviousTurn(convo.vars.currentTurn);
        await convo.setVar("previousTurn", previousTurn);
        await convo.setVar('nextTurnMessage', `

${PHRASES.CANCEL_PHRASE} ${PHRASES.STATUS_PHRASE}`);
        if (!previousTurn) {
            await convo.setVar("currentMessageType", MessageType.text);
        } else {
            await convo.setVar("currentMessageType", turnUtils.oppositeMessageType(previousTurn.messageType));
        }
        await convo.setVar("turnPrompt", turnUtils.makeTurnPrompt(previousTurn, convo.vars.currentMessageType));
    },


    /**
     * Create the "question" that a user interacts with to take their turn
     * @param  {object} convo  Botkit conversation that can ask questions
     */
    addTurnQuestion: (convo) => {
        convo.addQuestion("{{vars.turnPrompt}}", 
            [{
                default: true,
                handler: async function(response, inConvo, bot, full_message) {
                    if (turnUtils.isValidResponse(full_message.Body, inConvo.vars.currentMessageType)) {
                        try {
                            await models.turn.update({
                                message: full_message.Body,
                                messageType: inConvo.vars.currentMessageType,
                                receivedAt: new Date(),
                                isCurrent: false
                            }, {where: {id: inConvo.vars.currentTurn.id}});

                            const { gameId, nextUser } = inConvo.vars.currentTurn;
                            if (nextUser) {
                                const numberOfTurnsLeft = await turnUtils.getNumberOfTurnsLeft(gameId)
                                await inConvo.setVar('nextTurnMessage', `It is now ${nextUser.firstName}'s turn. ${utils.getNumberOfTurnsLeftMessage(numberOfTurnsLeft)} You will be notified when the game completes.

${PHRASES.CANCEL_PHRASE} ${PHRASES.STATUS_PHRASE}`)
                            } else {
                                await inConvo.setVar('nextTurnMessage', `You were the last player this round! You should receive a message with your game's transcript shortly.`);
                            }
                            await inConvo.gotoThread(TURN_SUCCESS_THREAD);
                        } catch(err){
                            console.log(err);
                            await inConvo.gotoThread(TURN_ERROR_THREAD);
                        }
                    } else {
                        await inConvo.gotoThread(TURN_FAIL_THREAD);
                    }
                }
            }], 'none', TURN_THREAD
        );
        
    },
    /**
     * Given the turn that was just completed, begin the next turn
     * @param  {object} completedTurn   Database Turn that was just completed.
     */
    beginNextTurn: async (completedTurn) => {
        let nextTurn = await models.turn.findOne({where: {userId: completedTurn.nextUserId, gameId: completedTurn.gameId}, include: [{model: models.user, as: "user"}, {model: models.user, as: "nextUser"}]})
        nextTurn.update({isCurrent: true});
        await module.exports.takeTurn(nextTurn)
    },
    /**
     * Given the game identifier, start the first turn of the game!
     * @param  {integer} gameId   gameId of game that needs to begin
     */
    takeFirstTurn: async (gameId) => {
        let currentTurn = await turnUtils.getCurrentTurn(gameId);
        await module.exports.takeTurn(currentTurn)
    },
    /**
     * Start a turn conversation with a specific phone number
     * @param  {object} turn   Database Turn to be taken.
     */
    takeTurn: async (turn) => {
        let turnBot = await utils.controller.spawn({});
        await turnBot.startConversationWithUser(turn.user.phoneNumber);
        await turnBot.beginDialog(TURN_CONVERSATION, {currentTurn: turn});
    }

}
