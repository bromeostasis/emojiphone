const turnUtils = require("./turn_utils");
const { GAME_NAME } = require('../utils/constants')

module.exports = {
    makeMmsUrl: async (gameId, platform) => {
        let isGroupMessage = true;

        let messageAndPhoneNumbers = await module.exports.getGameSummary(gameId, isGroupMessage);
        let phoneString = messageAndPhoneNumbers.phoneNumbers.join(',');

        let url = "sms://"

        if (platform == "ios") {
            url += `open?addresses=${phoneString};&`
        } else if (platform == "android") {
            url += `${phoneString};?`
        }

        url += `body=${encodeURI(messageAndPhoneNumbers.message)}`;

        return url;

    },
    /**
    * Creates a summary (including a transcript) of a given game
    * @param {uuid} gameId Database identifier for the game that needs to be summarized
    * @returns: {Object} phoneNumbersAndMessage Compound object with necessary data
    * @returns {string[]} phoneNumbersAndMessage.phoneNumbers List of phone numbers that played in the game
    * @returns {string} phoneNumbersAndMessage.message  Message that needs to be sent
    * }
    */
    getGameSummary: async (gameId) => {
        let usersAndMessages = await turnUtils.getUsersAndMessagesFromGameId(gameId);


        let message = `Great game of ${GAME_NAME} everyone! I've started a group text where we can discuss everything that went down. Here was our game:
`

        let phoneNumbers = [];

        for (let userMessage of usersAndMessages) {
            let user = userMessage.user;
            phoneNumbers.push(user.phoneNumber);
            let name = user.firstName;
            name += (user.lastName) ? " " + user.lastName : "";
            
            message += `
${name}: ${userMessage.message}`
        }

        return {
            phoneNumbers: phoneNumbers,
            message: message
        };

    },
}