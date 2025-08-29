import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import {
  companyName,
  companyOwnerName,
} from '../../Pages/CompanyInfo/CompanyInfo';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <React.Fragment>
      <footer className='footer'>
        <Container fluid={true}>
          <Row>
            <Col sm={6}>
              {new Date().getFullYear()} {companyName} {companyOwnerName} .
            </Col>
            <Col sm={6}>
              <div className='text-sm-end d-none d-sm-block'>
                <i className='mdi mdi-heart text-danger'></i> Créé Par{' '}
                <Link to={'https://www.cissemohamed.com'} target='blank'>
                  Cisse Mohamed
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
