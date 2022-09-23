
const KEYWORDS = {
    CANCEL_KEYWORD: 'finish',
	DONE_ADDING_CONTACTS_KEYWORD: 'done',
	INITIATE_GAME_KEYWORD: 'start',	
	QUIT_SETUP_KEYWORD: 'exit',
    STATUS_KEYWORD: 'status',
}

const PHRASES = {
    CANCEL_PHRASE: `Text "${KEYWORDS.CANCEL_KEYWORD}" to finish your game early.`,
	START_PHRASE: ` Text "${KEYWORDS.INITIATE_GAME_KEYWORD}" to begin a new game!`,
    STATUS_PHRASE: `Text "${KEYWORDS.STATUS_KEYWORD}" for a status update on your game.`,
}

const MESSAGES = {
	NOT_IN_GAME_MESSAGE: `You are not currently playing in a game! ${PHRASES.START_PHRASE}`
}

module.exports = {
	KEYWORDS,
	MESSAGES,
	PHRASES
}