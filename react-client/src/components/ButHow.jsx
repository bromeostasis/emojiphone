import React from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const ButHow = (props) => {
  return (
  	<>
	  <Row id='how'>
	  	<Col xs={2}></Col>
	  	<Col xs={8} className='d-flex justify-content-center'>
	  	  <h3>🤔 but how 🤔</h3>
	  	</Col>
	  	<Col xs={2}></Col>
	  </Row>
	  <Row className='pt-3'>
	  	<Col xs={6}>
	  		<p>
	  			1. Pick at least four of your funniest contacts.
  			</p>
		</Col>
	  </Row>
	  <Row>
	  	<Col xs={{span: 6, offset: 6}}>
	  		<p>
	  			2. One lucky friend creates a fun prompt for the group.
  			</p>
		</Col>
	  </Row>
	  <Row>
	  	<Col xs={6}>
	  		<p>
	  			3. When it's your turn, you'll translate the previous message between emoji-only and text-only.
  			</p>
		</Col>
	  </Row>
	  <Row>
	  	<Col xs={{span: 6, offset: 6}}>
	  		<p>
	  			4. Everyone receives a transcript of the game when it's complete!
  			</p>
			</Col>
	  </Row>
	  <Row className='mt-2'>
	    <Col xs={{span: 6, offset: 3}} className='d-flex justify-content-center'>
	      <Button onClick={() => window.location = '#play'}>⚡️play now⚡️</Button>
	    </Col>
	  </Row>
	</>
  )
}

export default ButHow;