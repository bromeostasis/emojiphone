import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import StartGameForm from './StartGame/StartGameForm'

function StartGame() {
	return (
		<>
			<Row id='play'>
				<Col className='d-flex justify-content-center'>
					<h3>🎉 start the party 🎉</h3>
				</Col>
			</Row>
			<Row className='mt-3'>
				<Col>
					<p>
						To start your game of {process.env.REACT_APP_GAME_NAME}, fill out the following form or text 
						<a className='inlineLink' href={`sms:+${process.env.REACT_APP_TWILIO_PHONE_NUMBER}?&body=new`}>
							&nbsp; "new" to {process.env.REACT_APP_DISPLAY_PHONE_NUMBER}.
						</a>
					</p>
				</Col>
			</Row>

			<StartGameForm />
		</>
	)
}

export default StartGame;