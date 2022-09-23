const KEYWORDS = {
    CANCEL_KEYWORD: 'finish',
	INITIATE_GAME_KEYWORD: 'start',	
    STATUS_KEYWORD: 'status',
}

const PHRASES = {
    CANCEL_PHRASE: `Text "${KEYWORDS.CANCEL_KEYWORD}" to finish your game early.`,
	START_PHRASE: `TEXT ME "${KEYWORDS.INITIATE_GAME_KEYWORD}" TO START`,
    STATUS_PHRASE: `Text "${KEYWORDS.STATUS_KEYWORD}" for a status update on your game.`,
}

const MESSAGES = {
	NOT_IN_GAME_MESSAGE: `You are not currently playing in a game! Text me the word "${KEYWORDS.INITIATE_GAME_KEYWORD}" to begin a new game!`
}

module.exports = {
	KEYWORDS,
	MESSAGES,
	PHRASES
}