import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const NavBar = (props) => {
  return (
    <Row>
    	<Col xs={6}>
    	  <h2>
	    	mojiph😌ne
    	  </h2>
    	 </Col>
    	 <Col xs={3}>
    	 	<a href='#how'>🤔 HOW?</a>
    	 </Col>
    	 <Col xs={3}>
    	 	<a href='#play'>▶️ PLAY</a>
    	 </Col>
    </Row>
  )
}

export default NavBar;