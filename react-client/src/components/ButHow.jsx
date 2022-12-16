import React from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const ButHow = (props) => {
  return (
  	<>
	  <Row id='how'>
	  	<Col xs={3}></Col>
	  	<Col xs={8}>
	  	  <h3>🤔 but how 🤔</h3>
	  	</Col>
	  	<Col xs={1}></Col>
	  </Row>
	  <Row className='pt-3'>
	  	<Col xs={6}>
	  		<p>
	  			1. Pick at least four of your funniest contacts.
  			</p>
		</Col>
		<Col xs={6}></Col>
	  </Row>
	  <Row>
		<Col xs={6}></Col>
	  	<Col xs={6}>
	  		<p>
	  			2. One lucky friend creates a fun prompt for the group.
  			</p>
		</Col>
	  </Row>
	  <Row>
	  	<Col xs={6}>
	  		<p>
	  			3. Respond to the text in emojis only when it's your turn.
  			</p>
		</Col>
		<Col xs={6}></Col>
	  </Row>
	  <Row>
		<Col xs={6}></Col>
	  	<Col xs={6}>
	  		<p>
	  			4. Everyone receives a transcript of the game when it's complete!
  			</p>
		</Col>
	  </Row>
	</>
  )
}

export default ButHow;