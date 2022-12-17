import React from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const HeroText = () => {
  return (
  	<>
	  <Row className='pt-3'>
	    <Col>
	      <p>
	        It's like a game of telephone but with emojis all mixed in. It's silly and it's fun and we think you're gonna like it... 😏
	      </p>
	    </Col>
	  </Row>
	  <Row>
	    <Col xs={3}></Col>
	    <Col xs={6}>
	      <Button>⚡️play now⚡️</Button>
	    </Col>
	    <Col xs={3}></Col>
	  </Row>
	 </>
  )
}

export default HeroText;