
const KEYWORDS = {
    CANCEL_KEYWORD: 'cancel',
	DONE_ADDING_CONTACTS_KEYWORD: 'done',
	INITIATE_GAME_KEYWORD: 'start',	
	QUIT_SETUP_KEYWORD: 'exit',
    RESTART_KEYWORD: 'again',
    STATUS_KEYWORD: 'status',
    UNSUBSCRIBE_KEWYORD: 'STOP',
}

const PHRASES = {
    CANCEL_PHRASE: `Text "${KEYWORDS.CANCEL_KEYWORD}" to ${KEYWORDS.CANCEL_KEYWORD} your game early.`,
	START_PHRASE: ` Text "${KEYWORDS.INITIATE_GAME_KEYWORD}" to begin a new game!`,
    STATUS_PHRASE: `Text "${KEYWORDS.STATUS_KEYWORD}" for a status update on your game.`,
    UNSUBSCRIBE_PHRASE: `Text "${KEYWORDS.UNSUBSCRIBE_KEWYORD}" to stop receiving all texts from this number.`,
	NOT_IN_GAME_PHRASE: `You are not currently playing in a game!`
}

module.exports = {
	KEYWORDS,
	MESSAGES,
	PHRASES
}