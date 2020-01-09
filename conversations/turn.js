const utils = require('../utils/utils');
const turnUtils = require('../utils/turn_utils');

const TURN_SUCCESS_THREAD = "success";
const TURN_FAIL_THREAD = "fail";
const TURN_THREAD = "turn";

module.exports = {
    /**
     * Create the converstaion thread where a user can take their turn
     * @param  {object} bot  Botkit bot that can create conversations
     * @param  {object} message  The intial message that was passed into the listener, should be INITIATE_GAME_KEYWORD
     */
    initiateTurnConversation: (bot, message) => {
        bot.createConversation(message, function(err, convo) {
            convo.addMessage({
                text: 'Time to take your turn in your game of Emojiphone!', 
                action: TURN_THREAD
            });

            convo.addMessage('Thanks, your turn has been recorded! You will be notified when the game completes.', TURN_SUCCESS_THREAD);
            
            convo.addMessage({
                text: 'Sorry your response was not written in ONLY (TODO) text. Please try again!',
                action: TURN_THREAD
            }, TURN_FAIL_THREAD);

            convo.addQuestion(`Text your response to the following prompt using ONLY (TODO) text:
Bleep bloop booopowpa doo(TODO)`, 
                [
                    {
                        default: true,
                        callback: async (response, convo) => {
                            let messageType = "doesn't matter for now";
                            if (turnUtils.isValidResponse(response.Body, messageType)) {
                                convo.gotoThread(TURN_SUCCESS_THREAD);
                            } else {
                                convo.gotoThread(TURN_FAIL_THREAD);
                            }
                        }
                    }
                ], {}, TURN_THREAD
            );

            convo.activate();
        })
    }
}
