import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const NavBar = (props) => {
  return (
    <Row>
    	<Col xs={5}>
    	  <h2>
	    	mojiph😌ne
    	  </h2>
    	 </Col>
    	 <Col xs={1}></Col>
    	 <Col xs={3}>
    	 	<a href='#what'>🤔 WHAT?</a>
    	 </Col>
    	 <Col xs={3}>
    	 	<a href='#play'>▶️ PLAY</a>
    	 </Col>
    </Row>
  )
}

export default NavBar;