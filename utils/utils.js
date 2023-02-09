const { Botkit } = require('botkit');
const { TwilioAdapter } = require('botbuilder-adapter-twilio-sms');
const { PostgresStorage } = require('@bromeostasis/botbuilder-storage-postgres');
const entities = require('entities')
const vCard = require('vcard');


process.env.NODE_ENV = (process.env.NODE_ENV) ? process.env.NODE_ENV :  "development";
require('custom-env').env(true);


var fetch = require('node-fetch');
const models = require('../models');

module.exports = {
    bot: {},
    controller: {},
    postgresStorage: {},
    /**
     * Provided an MMS vCard text message, fetch the vCard data and return a "User" js object (fname, lname, phone number).
     * @param  {BotKit Response} message 
     */
    vCardMessageToUser: async (url) => {
        var card = new vCard();

        const response = await fetch(url, { redirect: 'follow' });
        const textContent = await response.text();

        return new Promise((resolve, reject) => {
            card.readData(textContent, function(err, json) {
                names = json.N.split(',');
                resolve({
                    firstName: names[1].trim(),
                    lastName: names[0].trim(),
                    phoneNumber: json.TEL.value
                });
            });
        });
    },
    createBot: async () => {
        const postgresStorage = new PostgresStorage({
            uri : process.env.DATABASE_URI
        });
        let adapter = new TwilioAdapter({
            debug: true,
            account_sid: process.env.TWILIO_ACCOUNT_SID,
            auth_token: process.env.TWILIO_AUTH_TOKEN,
            twilio_number: process.env.TWILIO_PHONE_NUMBER,
        });

        module.exports.controller = new Botkit({
            adapter: adapter,
            storage: postgresStorage
        })

        // Botkit html encodes its variables for some reason.. This undoes that :)
        // See more here: https://github.com/howdyai/botkit/issues/240#issuecomment-432296085
        module.exports.controller.middleware.send.use((bot, message, next) => {
            message.text = entities.decodeHTML(message.text)
            next();  
        });

        module.exports.bot = await module.exports.controller.spawn({});
        module.exports.postgresStorage = postgresStorage;
    },
    getUserByPhoneNumber: async (phoneNumber) => {
        let user = await models.user.findOne({where: {phoneNumber: phoneNumber}});        
        return user;
    },
    /**
     * Create a new user in the database
     * @param  {String} nameString String containing at least a first name, and potentially a last name
     * @param  {String} phoneNumber User's phone number.
     * @param  {Boolean needsOnboarding} Whether the user needs onboarding. 
       Defaults to true unless the user has actively chosen to engage with the platform (setting up a game for the first time)

    */
    addUser: async (nameString, phoneNumber, needsOnboarding=true) => {
        let nameStrings = nameString.split(' ');
        let user = {
            firstName: nameStrings[0],
            phoneNumber: phoneNumber,
            needsOnboarding,
        }
        if (nameStrings.length > 1) {
            user["lastName"] = nameString.substring(nameString.indexOf(' ') + 1);
        }
        let dbUser = await models.user.create(user)
        return dbUser;
    },
    getPostgresStorageKeyFromPhoneNumber: (phoneNumber) => {
        return `twilio-sms/conversations/${phoneNumber}-${phoneNumber}/`
    },
    getNumberOfTurnsLeftMessage: (numberOfTurnsLeft) => {
        return `There ${(numberOfTurnsLeft === 1) ? 'is 1 turn' : `are ${numberOfTurnsLeft} turns`} left in your game!`
    }
}