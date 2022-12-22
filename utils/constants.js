
const GAME_NAME = 'mojiphone'

const KEYWORDS = {
    CANCEL_KEYWORD: 'cancel',
	DONE_ADDING_CONTACTS_KEYWORD: 'done',
	INITIATE_GAME_KEYWORD: 'new',	
	QUIT_SETUP_KEYWORD: 'quit',
    RESTART_KEYWORD: 'restart',
    STATUS_KEYWORD: 'status',
    UNSUBSCRIBE_KEWYORD: 'STOP',
}

const PHRASES = {
    CANCEL_PHRASE: `Text "${KEYWORDS.CANCEL_KEYWORD}" to ${KEYWORDS.CANCEL_KEYWORD} your game early.`,
	START_PHRASE: `Text "${KEYWORDS.INITIATE_GAME_KEYWORD}" to start a new game!`,
    STATUS_PHRASE: `Text "${KEYWORDS.STATUS_KEYWORD}" for a status update on your game.`,
    UNSUBSCRIBE_PHRASE: `Text "${KEYWORDS.UNSUBSCRIBE_KEWYORD}" to stop receiving all texts from this number.`,
	NOT_IN_GAME_PHRASE: `You are not currently playing in a game!`
}

PHRASES['START_GAME_FROM_WEB_PHRASE'] = `You have successfully started a game of ${GAME_NAME}! ${PHRASES.CANCEL_PHRASE} ${PHRASES.STATUS_PHRASE}`

module.exports = {
	GAME_NAME,
	KEYWORDS,
	PHRASES
}