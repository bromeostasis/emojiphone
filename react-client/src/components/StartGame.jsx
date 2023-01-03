import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import StartGameForm from './StartGame/StartGameForm'

const PHONE_NUMBER = '+12015848173'

function StartGame() {
	return (
		<>
			<Row id='play'>
				<Col className='d-flex justify-content-center'>
					<h3>🎉 start the party 🎉</h3>
				</Col>
			</Row>
			<Row>
				<Col>
					<p>
						To start your game of mojiphone, fill out the following form or text 
						<a href={`sms:+${PHONE_NUMBER}?&body=new`}>
							"new" to {PHONE_NUMBER}.
						</a>
					</p>
				</Col>
			</Row>

			<StartGameForm />
		</>
	)
}

export default StartGame;