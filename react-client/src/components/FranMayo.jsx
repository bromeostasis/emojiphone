import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import instagram from './FranMayo/instagram.png'

const FRANMAYO = (props) => {
  return (
  	<Container className='fran mt-3 pt-3 pb-3' fluid>
	    <Row>
	    	<Col xs={8}>
	    		Website design by <a className='inlineLink' rel="noreferrer" href='https://www.fran.land/' target='_blank'>Fran</a>
	    	</Col>
	    	<Col xs={4} className='d-flex justify-content-end align-items-center'>
	    		<a className='imageLink' href='https://www.instagram.com/mojiphone.fun/' target='_blank'>
	    			<img src={instagram} />
	    		</a>
	    	</Col>
	    </Row>
	</Container>
  )
}

export default FRANMAYO;