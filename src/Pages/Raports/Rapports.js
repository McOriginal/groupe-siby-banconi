import { Card, CardBody, CardTitle, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import React from 'react';
import RaportsBarChart from './DataRaportsCommandesPaiements';
import BarChartEntreSortie from './DataRaportsEntreSortie';
import RapportByDay from './RapportByDay';
import RapportBySemaine from './RapportBySemaine';
import SelectedMounthTotalResult from './SelectedMounthTotalResult';
import { companyName } from '../CompanyInfo/CompanyInfo';

const Rapports = () => {
  document.title = 'Raports | Centre de Santé - MARHABA ';
  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid={true}>
          <Breadcrumbs title='Statistique' breadcrumbItem='Raports' />

          <Row>
            <Col sm={12}>
              <RapportByDay />
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <RapportBySemaine />
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <SelectedMounthTotalResult />
            </Col>

            <Col sm={12}>
              <Card>
                <CardBody>
                  <CardTitle>Entrée et Sortie</CardTitle>
                  <p className='card-title-desc'>
                    Le raports de {companyName} vous permet de visualiser les
                    données statistiques concernant les
                    <span className='text-info'>
                      {' '}
                      Entrées, & Dépenses.
                    </span>{' '}
                    Vous pouvez également suivre l'évolution des revenus et des
                    dépenses mensuelles.
                  </p>
                  <BarChartEntreSortie />
                </CardBody>
              </Card>
            </Col>

            <Col sm={12}>
              <Card>
                <CardBody>
                  <CardTitle>Rapports et Suivis</CardTitle>
                  <p className='card-title-desc'>
                    Le raports de {companyName} vous permet de visualiser les
                    données statistiques concernant les
                    <span className='text-info'>
                      {' '}
                      Commandes, Paiements.
                    </span>{' '}
                    Vous pouvez également suivre l'évolution des revenus
                    mensuels.
                  </p>
                  <RaportsBarChart />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Rapports;
