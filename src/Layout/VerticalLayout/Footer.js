import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';

const Footer = () => {
  return (
    <React.Fragment>
      <footer className='footer'>
        <Container fluid={true}>
          <Row>
            <Col sm={6}>
              {new Date().getFullYear()} © Centre de Santé MARHABA.
            </Col>
            <Col sm={6}>
              <div className='text-sm-end d-none d-sm-block'>
                Crafted with <i className='mdi mdi-heart text-danger'></i> by{' '}
                <Link
                  to='https://www.cissemohamed.com'
                  target='blank'
                  className='text-decoration-underline'
                >
                  Cisse Mohamed{' '}
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  );
};

export default Footer;
