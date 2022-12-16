import React from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const HeroText = () => {
  return (
  	<>
	  <Row>
	    <Col>
	      <p>
	        It's like a game of telephone but you only use emojis. It's silly and it's fun and we think you're gonna like it... 😏
	      </p>
	    </Col>
	  </Row>
	  <Row>
	    <Col></Col>
	    <Col>
	      <Button>⚡️play now⚡️</Button>
	    </Col>
	    <Col></Col>
	  </Row>
	 </>
  )
}

export default HeroText;