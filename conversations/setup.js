require('custom-env').env(true);

const phone = require("phone");
const { BotkitConversation } = require('botkit');


const { GAME_NAME, KEYWORDS, PHRASES } = require('../utils/constants')
const utils = require('../utils/utils');
const setupUtils = require('../utils/setup_utils');
const cancelConversation = require('./cancel');
const statusConversation = require('./status');
const models = require('../models');

const V_CARD_TYPE = 'text/x-vcard';
const START_GAME_THREAD = 'startGame';
const NOT_READY_YET_THREAD = 'notReadyYet';
const QUIT_GAME_THREAD = 'quitGame';
const ADD_CONTACTS_THREAD = 'addContacts';
const INVALID_INPUT_THREAD = 'invalidInput';
const ADDED_PHONE_NUMBER_THREAD = 'addedPhone';
const MULTI_CONTACT_THREAD = 'multiContact';
const ERROR_THREAD = 'errorThread';
const DUPLICATE_NUMBER_THREAD = 'duplicateThread';
const INVALID_NUMBER_THREAD = 'invalidNumber';
const ADD_USER_THREAD = 'addUser';
const ADDED_USER_THREAD = 'addedUser';
const CONTACT_ERROR_THREAD = 'contactError';
const NEW_USER_THREAD = 'newUser';
const EXISTING_USER_THREAD = 'existingUser';
const COMPLETE_CONVO_ACTION = 'complete';
const ALREADY_ACTIVE_THREAD = 'alreadyActive';
const DEFAULT_THREAD = 'default';
const NAME_PATTERN = /^[a-zA-Z][a-zA-Z\-\s]+$/;
const ERROR_RESPONSE = "Sorry, we encountered an error processing your request. Please try again or contact our support team at TODO.";
const FIRST_TIME_WELCOME_PROMPT = `Welcome to ${GAME_NAME}! Thanks for starting a new game!`;
const ALREADY_ACTIVE_ERROR = "Sorry, you've added someone that is already playing in an active game. We currently only support one game at a time (though multi-game support is coming soon!).";
const ALREADY_ACTIVE_GAME_ERROR = ALREADY_ACTIVE_ERROR + `

Please confirm no users are in an existing game and set up your game again.`

let quitGameResponse = {
    pattern: KEYWORDS.QUIT_SETUP_KEYWORD,
    handler: async function(response, convo) {
        await convo.gotoThread(QUIT_GAME_THREAD);
    },
}

module.exports = {
    SETUP_CONVERSATION: 'setupConversation',
    /**
     * Create the converstaion thread where a user can start the game.
     */
    setupSetupConversation: async () => {
        let convo = new BotkitConversation(module.exports.SETUP_CONVERSATION, utils.controller);

        convo.before(DEFAULT_THREAD, async(convo, bot) => {
            await module.exports.setConversationVariables(convo);
        })

        // Add this to default thread to avoid 'length of undefined' error. convo.before will always skip this
        // FYI: This fires when db is not setup properly!
        convo.say("Anything..");

        module.exports.addCreatorAsUserQuestion(convo);
        module.exports.addCreatorAsUserMessages(convo);
        module.exports.addContactsQuestion(convo);
        module.exports.addContactsMessages(convo);

        convo.addMessage({
            text: `Welcome to ${GAME_NAME}! Thanks for starting a new game!`,
            action: ADD_USER_THREAD
        }, NEW_USER_THREAD);

        convo.addMessage({
            text: `Welcome back to ${GAME_NAME}, {{vars.currentUser.firstName}}! Thanks for starting a new game!`,
            action: ADD_CONTACTS_THREAD
        }, EXISTING_USER_THREAD);

        convo.after(async(results, bot) => {
            setupUtils.startGameIfReady(results);
        })

        await utils.controller.addDialog(convo);
    },
    setConversationVariables: async (convo) => {
        let phoneNumber = phone(convo.vars.channel)[0];
        let user;
        try {
            await convo.setVar("addedUsers", '');
            await convo.setVar("invalidUsers", '');
            await convo.setVar("duplicateUsers", '');
            await convo.setVar("ingameUsers", '');
            user = await utils.getUserByPhoneNumber(phoneNumber);
            await convo.setVar("contactsLeft", process.env.MINIMUM_PLAYER_COUNT - 1);
            await convo.setVar("gameUsers", []);
            if (!user) {
                await convo.setVar("welcomeText", FIRST_TIME_WELCOME_PROMPT);
                await convo.gotoThread(NEW_USER_THREAD);
            } else {
                await convo.setVar("welcomeText", `Welcome back to ${GAME_NAME}, ${user.firstName}! Thanks for starting a new game!`);
                await convo.setVar("currentUser", user);
                await convo.gotoThread(EXISTING_USER_THREAD);
            }
        } catch (err) {
            console.log(err);
        }
    },
    addCreatorAsUserQuestion: (convo) => {
        convo.addQuestion(`Since this is your first time playing, we'll need a way to identify you. What's your name (you may enter first and last)?

Text "${KEYWORDS.QUIT_SETUP_KEYWORD}" at any time to quit the setup process.`, [
            quitGameResponse,
            {
                default: true,
                handler: async (response, inConvo, bot, full_message) => {
                    if (NAME_PATTERN.test(full_message.Body)) {
                        try {
                            let phoneNumber = phone(inConvo.vars.channel)[0];
                            await utils.addUser(full_message.Body, phoneNumber, false);
                            await inConvo.gotoThread(ADDED_USER_THREAD);
                        } catch (err) {
                            console.log(err);
                            await inConvo.gotoThread(CONTACT_ERROR_THREAD);
                        }
                    } else {
                        await inConvo.gotoThread(CONTACT_ERROR_THREAD);
                    }
                }
            }
        ], {}, ADD_USER_THREAD);
    },
    addCreatorAsUserMessages: (convo) => {
        convo.addMessage({
            text: "Great, now let's get started setting up your first game!",
            action: ADD_CONTACTS_THREAD
        }, ADDED_USER_THREAD);

        convo.addMessage({
            text: 'Please provide us with your name; no numbers or special characters!',
            action: ADD_USER_THREAD
        }, CONTACT_ERROR_THREAD);
    },
    // TODO: Pull out callbacks as separate functions
    addContactsQuestion: async (convo) => {
        convo.addQuestion(`Time to set up your game! Text me at least {{vars.contactsLeft}} more contacts to be able to start your game.

Text "${KEYWORDS.DONE_ADDING_CONTACTS_KEYWORD}" when you want to start the game or "${KEYWORDS.QUIT_SETUP_KEYWORD}" if you don't want to play.`, [
            {
                pattern: KEYWORDS.DONE_ADDING_CONTACTS_KEYWORD,
                handler: async (response, inConvo, bot, full_message) => {
                    let users = inConvo.vars.gameUsers;
                    if (setupUtils.isGameReady(users)) {
                        await inConvo.setVar("gameReady", true);
                        await inConvo.gotoThread(START_GAME_THREAD);
                    } else {
                        await inConvo.gotoThread(NOT_READY_YET_THREAD);
                    }
                },
            }, quitGameResponse,
            {
                default: true,
                handler: handleContactCards,
            }
        ], {}, ADD_CONTACTS_THREAD);
    },
    addContactsMessages: (convo) => {
        convo.addMessage({
            text: 'Successfully added your contact!',
            action: ADD_CONTACTS_THREAD
        }, ADDED_PHONE_NUMBER_THREAD);


        convo.addMessage({ // TODO: Entire phrase is variable.
            text: `Thank you for uploading contacts. 

The following contacts were added to your game: {{vars.addedUsers}}

The following contacts had invalid phone numbers: {{vars.invalidUsers}}

The following contacts are already in your game: {{vars.duplicateUsers}}

The following contacts are already playing in another game: {{vars.ingameUsers}}
`,
            action: ADD_CONTACTS_THREAD
        }, MULTI_CONTACT_THREAD);

        convo.addMessage({
            text: `Sorry, I couldn't understand you. Please send a contact, or say "${KEYWORDS.DONE_ADDING_CONTACTS_KEYWORD}" or "${KEYWORDS.QUIT_SETUP_KEYWORD}".`,
            action: ADD_CONTACTS_THREAD
        }, INVALID_INPUT_THREAD);

        convo.addMessage({
            text: ERROR_RESPONSE,
            action: ADD_CONTACTS_THREAD
        }, ERROR_THREAD);

        convo.addMessage({
            text: "Sorry, you've already added someone with that phone number. Please choose a contact with a phone number different from any you've added so far",
            action: ADD_CONTACTS_THREAD
        }, DUPLICATE_NUMBER_THREAD);

        convo.addMessage({
            text: ALREADY_ACTIVE_ERROR,
            action: ADD_CONTACTS_THREAD
        }, ALREADY_ACTIVE_THREAD);

        convo.addMessage({
            text: "Sorry, the phone number for that contact is invalid. Please try another contact with a valid US-based phone number.",
            action: ADD_CONTACTS_THREAD
        }, INVALID_NUMBER_THREAD);
        
        convo.addMessage({
            text: `Ok, you will not start the game. ${PHRASES.START_WEB_PHRASE}`,
            action: COMPLETE_CONVO_ACTION
        }, QUIT_GAME_THREAD);
        convo.addMessage({
            text: `Ok, we will begin the game! ${PHRASES.CANCEL_PHRASE} ${PHRASES.STATUS_PHRASE}`,
            action: COMPLETE_CONVO_ACTION
        }, START_GAME_THREAD);

        convo.addMessage({
            text: `Oops! You don't have enough other players. Please add at least {{vars.contactsLeft}} more contacts.`,
            action: ADD_CONTACTS_THREAD,
        }, NOT_READY_YET_THREAD);
    },
}

const handleContactCards = async (response, inConvo, bot, full_message) => {
    console.log('Whats in the box?!')
    // console.log('full msga', full_message)
    console.log('response', response)
    if (full_message && full_message.MediaContentType0 && full_message.MediaContentType0.toLowerCase() === V_CARD_TYPE) {
        try {
            const numSegments = parseInt(full_message.NumSegments)
            const validUsersAdded = []
            const invalidUsersAdded = []
            const duplicateUsersAdded = []
            const ingameUsersAdded = []
            for (let i = 0; i < numSegments; i++) {
                const typeKey = `MediaContentType${i}`
                if (full_message[typeKey] && full_message[typeKey].toLowerCase() == V_CARD_TYPE) {
                    const urlKey = `MediaUrl${i}`
                    const url = full_message[urlKey]
                    console.log('url', url)
                    const userObj = await utils.vCardMessageToUser(url);
            
                    let validatedNumber = phone(userObj.phoneNumber, "USA");
                    console.log('number?!', validatedNumber)
                    if (validatedNumber.length == 0 ){
                        // return await inConvo.gotoThread(INVALID_NUMBER_THREAD);
                        console.log('invalid')
                        invalidUsersAdded.push(userObj)
                    }

                    userObj.phoneNumber = validatedNumber[0];
                    let usersInGame = inConvo.vars.gameUsers;
                    if (setupUtils.containsPhoneNumber(usersInGame, userObj.phoneNumber)) {
                        console.log('duplicate')
                        duplicateUsersAdded.push(userObj)
                        // await inConvo.gotoThread(DUPLICATE_NUMBER_THREAD);
                    } else {
                        const dbUser = await setupUtils.createUser(userObj)
                        const isInActiveGame = await setupUtils.isUserInActiveGame(dbUser)
                        if (isInActiveGame) {
                            console.log('ingame')
                            ingameUsersAdded.push(dbUser)
                            // return await inConvo.gotoThread(ALREADY_ACTIVE_THREAD)
                        }
                        usersInGame.push(dbUser);
                        await inConvo.setVar("gameUsers", usersInGame);
                        let contactsLeft = (inConvo.vars.contactsLeft > 0) ? inConvo.vars.contactsLeft - 1 : 0;
                        await inConvo.setVar("contactsLeft", contactsLeft);
                        console.log('legit')
                        validUsersAdded.push(userObj) // TODO: Likely concat?
                        // await inConvo.gotoThread(ADDED_PHONE_NUMBER_THREAD);
                    }
                } else {
                    console.log('Message not VCARD. Skipping')
                }
            }
            console.log('validUsersAdded', validUsersAdded);
            console.log('invalidUsersAdded', invalidUsersAdded);
            console.log('duplicateUsersAdded', duplicateUsersAdded);
            console.log('ingameUsersAdded', ingameUsersAdded);

            await inConvo.setVar("addedUsers", validUsersAdded.map((user) => user.firstName).join(', '));
            await inConvo.setVar("invalidUsers", invalidUsersAdded.map((user) => user.firstName).join(', '));
            await inConvo.setVar("duplicateUsers", duplicateUsersAdded.map((user) => user.firstName).join(', '));
            await inConvo.setVar("ingameUsers", ingameUsersAdded.map((user) => user.firstName).join(', '));

            await inConvo.gotoThread(MULTI_CONTACT_THREAD)
            // if (validUsersAdded.length > 0) {
            // } else {
            //     await inConvo.gotoThread(ERROR_THREAD)
            // }


        } catch (err) { // TODO: Better error handling
            console.log("Error downloading vcard", err);
            return await inConvo.gotoThread(ERROR_THREAD);
        }
    } else {
        await inConvo.gotoThread(INVALID_INPUT_THREAD);
    }
}