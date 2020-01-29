const phone = require("phone");

const utils = require('../utils/utils');
const setupUtils = require('../utils/setup_utils');
const turnConversation = require('./turn');

const DONE_ADDING_CONTACTS_KEYWORD = 'done';
const QUIT_ADDING_CONTACTS_KEYWORD = 'exit';
const START_GAME_THREAD = 'startGame';
const NOT_READY_YET_THREAD = 'notReadyYet';
const QUIT_GAME_THREAD = 'quitGame';
const ADD_CONTACTS_THREAD = 'addContacts';
const INVALID_INPUT_THREAD = 'invalidInput';
const ADDED_PHONE_NUMBER_THREAD = 'addedPhone';
const ERROR_THREAD = 'errorThread';
const DUPLICATE_NUMBER_THREAD = 'duplicateThread';
const INVALID_NUMBER_THREAD = 'invalidNumber';

module.exports = {
    INITIATE_GAME_KEYWORD: "start",
    /**
     * Create the converstaion thread where a user can start the game.
     * @param  {object} message  The intial message that was passed into the listener, should be INITIATE_GAME_KEYWORD
     */
    initiateGameConversation: (message) => {
        utils.bot.createConversation(message, function(err, convo) {
        convo.addMessage({
            text: 'Welcome to Emojiphone! Thanks for starting a new game!', 
            action: ADD_CONTACTS_THREAD
        });

        module.exports.addContactsQuestion(convo, utils.bot);

        convo.addMessage({
            text: 'Successfully added your contact!',
            action: ADD_CONTACTS_THREAD
        }, ADDED_PHONE_NUMBER_THREAD);

        convo.addMessage({
            text: `Sorry, I couldn't understand you. Please send a contact, or say "${DONE_ADDING_CONTACTS_KEYWORD}" or "${QUIT_GAME_THREAD}".`,
            action: ADD_CONTACTS_THREAD
        }, INVALID_INPUT_THREAD);

        convo.addMessage({
            text: "Sorry, we encountered an error processing your contact. Please try again or contact our support team at TODO.",
            action: ADD_CONTACTS_THREAD
        }, ERROR_THREAD);

        convo.addMessage({
            text: "Sorry, you've already added someone with that phone number. Please choose a contact with a phone number different from any you've added so far",
            action: ADD_CONTACTS_THREAD
        }, DUPLICATE_NUMBER_THREAD);

        convo.addMessage({
            text: "Sorry, the phone number for that contact is invalid. Please try another contact with a valid US-based phone number.",
            action: ADD_CONTACTS_THREAD
        }, INVALID_NUMBER_THREAD);
        
        convo.addMessage(`Ok, you will not start the game. Text "${module.exports.INITIATE_GAME_KEYWORD}" to begin a new game!`, QUIT_GAME_THREAD);
        convo.addMessage('Ok, we will begin the game!', START_GAME_THREAD);

        convo.addMessage({
            text: `Oops! You don't have enough other players. Please add at least ${setupUtils.MINIMUM_PLAYER_COUNT - 1} total contacts.`,
            action: ADD_CONTACTS_THREAD,
        }, NOT_READY_YET_THREAD);

        convo.activate();
      }); 
    },
    // TODO: Pull out callbacks as separate functions
    addContactsQuestion: (convo) => {
        let users = [];
        
        convo.addQuestion(`Time to set up your game! Text me at least ${setupUtils.MINIMUM_PLAYER_COUNT - 1} total contacts to be able to start your game.

        Text "${DONE_ADDING_CONTACTS_KEYWORD}" when you want to start the game or "${QUIT_ADDING_CONTACTS_KEYWORD}" if you don't want to play.`, [
            {
                pattern: DONE_ADDING_CONTACTS_KEYWORD,
                callback: async function(response, convo) {
                    if (setupUtils.isGameReady(users)) {
                        try {
                            let turns = await setupUtils.setupGame(users);
                            if (Array.isArray(turns) && turns.length > 0) {
                                convo.gotoThread(START_GAME_THREAD);
                                turnConversation.takeFirstTurn(turns[0].gameId);
                            } else {
                                convo.gotoThread(ERROR_THREAD);
                            }
                        } catch (err) {
                            convo.gotoThread(ERROR_THREAD);
                        }
                    } else {
                        convo.gotoThread(NOT_READY_YET_THREAD);
                    }
                },
            },
            {
                pattern: QUIT_ADDING_CONTACTS_KEYWORD,
                callback: function(response, convo) {
                    convo.gotoThread(QUIT_GAME_THREAD);
                },
            },
            {
                default: true,
                callback: async function(response, convo) {
                    if (response.MediaContentType0 === 'text/x-vcard') {
                        try {
                            let user = await utils.downloadVCard(response);
                            let validatedNumber = phone(user.phoneNumber, "USA");
                            if (validatedNumber.length == 0 ){
                                return convo.gotoThread(INVALID_NUMBER_THREAD);
                            }
                            user.phoneNumber = validatedNumber[0];
                            if (setupUtils.containsPhoneNumber(users, user.phoneNumber)) {
                                convo.gotoThread(DUPLICATE_NUMBER_THREAD);
                            } else {
                                users.push(user);
                                convo.gotoThread(ADDED_PHONE_NUMBER_THREAD);
                            }
                        } catch (err) {
                            console.log("Error downloading vcard", err);
                            return convo.gotoThread(ERROR_THREAD);
                        }
                    } else {
                        convo.gotoThread(INVALID_INPUT_THREAD);
                    }
                },
            }
        ], {}, ADD_CONTACTS_THREAD);
    },
}