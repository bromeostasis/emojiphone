import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const Feedback = ({ inputRef }) => {
  return (
  	<>
	  <Row id='feedback' ref={inputRef}>
	    <Col className='d-flex justify-content-center'>
	      <h3>
	        🙇‍♂️ how's it going? 🙇‍♂️
	      </h3>
	    </Col>
	  </Row>
	  <Row>
	    <Col className='d-flex justify-content-center mt-3'>
	      <p>
	      	We are currently in open beta and we could use all the feedback you've got! It will help make the {process.env.REACT_APP_GAME_NAME} the best it can possibly be. Thanks in advance!
	      </p>
	    </Col>
	  </Row>
	  <Row>
	    <Col className='d-flex justify-content-center mt-3'>
	      <a href='/feedback' target='_blank' className='inlineLink'>
	      	🧠 let us know 🧠
	      </a>
	    </Col>
	  </Row>
	 </>
  )
}

export default Feedback;