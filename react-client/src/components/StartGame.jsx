import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import StartGameForm from './StartGame/StartGameForm'

function StartGame() {
	return (
		<>
			<Row>
				<Col className='d-flex justify-content-center'>
					<h3>🎉 get the party started 🎉</h3>
				</Col>
			</Row>
			<StartGameForm />
		</>
	)
}

export default StartGame;