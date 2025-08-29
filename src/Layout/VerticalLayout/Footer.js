import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { companyName } from '../../Pages/CompanyInfo/CompanyInfo';

const Footer = () => {
  return (
    <React.Fragment>
      <footer className='footer'>
        <Container fluid={true}>
          <Row>
            <Col sm={6}>
              {new Date().getFullYear()} © {companyName}.
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
