var path = require('path');

const setupConversation = require('./conversations/setup');
const setupUtils = require('./utils/setup_utils');
const turnUtils = require('./utils/turn_utils');
const turnConversation = require('./conversations/turn');
const restartConversation = require('./conversations/restart');
const cancelConversation = require('./conversations/cancel');
const statusConversation = require('./conversations/status');

const services = require('./services/services')
const utils = require('./utils/utils');
const { KEYWORDS } = require('./utils/constants')
const models = require('./models');
const User = require('./models/user');
const mmsUtils = require('./utils/mms_utils');

const ios = 'ios';
const android = 'android';
const acceptablePlatforms = [android, ios];

module.exports = {
    setup: async function() {
        await utils.createBot();

        await this.setupWebserver();

        await setupConversation.setupSetupConversation();
        await turnConversation.setupTurnConversation();
        await restartConversation.setupRestartConversation();
        await cancelConversation.setupCancelConversation();

        await this.setupKeywords();
    },
    setupKeywords: async function() {
        utils.controller.hears([KEYWORDS.INITIATE_GAME_KEYWORD], 'message', async (bot, message) => {
            try {
                await bot.beginDialog(setupConversation.SETUP_CONVERSATION);
            } catch(e) {
                console.log(e);
            }
        });

        utils.controller.hears([KEYWORDS.RESTART_KEYWORD], 'message', async (bot, message) => {
            try {
                await bot.beginDialog(restartConversation.RESTART_CONVERSATION);
            } catch(e) {
                console.log(e);
            }
        });

        utils.controller.hears([KEYWORDS.CANCEL_KEYWORD], 'message', async (bot, message) => {
            try {
                await bot.beginDialog(cancelConversation.CANCEL_CONVERSATION);
            } catch(e) {
                console.log(e);
            }
        });

        utils.controller.hears([KEYWORDS.STATUS_KEYWORD], 'message', async (bot, message) => {
            try {
                const statusMessage = await statusConversation.getStatusMessage(bot, message)
                await bot.say(statusMessage)
            } catch(e) {
                console.log(e);
            }
        });        
    },
    setupWebserver: async function() {
        utils.controller.webserver.get('/mmsLink/:platform/:gameId', async(req, res) => {
            let platform = req.params.platform.toLowerCase();
            if (acceptablePlatforms.indexOf(platform) == -1) {
                return res.status(400).send("Platform must be 'ios' or 'android'");
            }
            let url = await mmsUtils.makeMmsUrl(req.params.gameId, platform);
            res.set('location', url);
            res.status(301).send()
            
        })

        utils.controller.webserver.get('/test', async(req, res) => {
            res.status(200).send({express: 'test received'})
        })

        utils.controller.webserver.post('/startGame', async(req, res) => {
            console.log(req.body)
            const { status, response } = await services.startGame(req.body)
            console.log(status, response)
            res.status(status).send(response)
        })

        utils.controller.publicFolder('/', path.join(__dirname, "react-client/build/"));
        utils.controller.webserver.get("/home", (req, res) => {
            res.sendFile(path.join(__dirname, "react-client/build", "index.html"))
        })
    }
}
