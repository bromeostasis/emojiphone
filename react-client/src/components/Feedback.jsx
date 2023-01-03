import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const Feedback = () => {
  return (
  	<>
	  <Row id='feedback'>
	    <Col className='d-flex justify-content-center'>
	      <h3>
	        🙇‍♂️ how's it going? 🙇‍♂️
	      </h3>
	    </Col>
	  </Row>
	  <Row>
	    <Col className='d-flex justify-content-center pt-3'>
	      <p>
	      	We are currently in open beta and we could use all the feedback you've got! It will help make the mojiphone the best it can possibly be. Thanks in advance!
	      </p>
	    </Col>
	  </Row>
	  <Row>
	    <Col className='d-flex justify-content-center pt-3'>
	      <a href='/feedback' target='_blank'>
	      	🧠 let us know 🧠
	      </a>
	    </Col>
	  </Row>
	 </>
  )
}

export default Feedback;