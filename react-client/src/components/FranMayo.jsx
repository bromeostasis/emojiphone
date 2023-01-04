import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

const FRANMAYO = (props) => {
  return (
  	<Container className='fran mt-3 pt-3 pb-3' fluid>
	    <Row >
	    	<Col>
	    		Website design by <a className='inlineLink' href='https://www.fran.land/' target='_blank'>Fran</a>
	    	</Col>
	    </Row>
	</Container>
  )
}

export default FRANMAYO;