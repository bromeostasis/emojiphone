import React from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const HeroText = () => {
  return (
  	<>
	  <Row className='mt-3 content-end navText'>
	    <Col>
	      <p>
	        It's like a game of telephone but with emojis all mixed in. It's silly and it's fun and we think you're gonna like it... 😏
	      </p>
	    </Col>
	  </Row>
	  <Row>
	    <Col xs={{span: 6, offset: 3}} className='d-flex justify-content-center'>
	      <Button onClick={() => window.location = '#play'}>⚡️play now⚡️</Button>
	    </Col>
	  </Row>
	 </>
  )
}

export default HeroText;