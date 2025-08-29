import React from 'react';
import { motion } from 'framer-motion';

import { Row, Container, Col } from 'reactstrap';
//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';

import TotalFounisseurs from './TotalFournisseurs';
import TotalProduit from './TotalProduit';
import TotalCommande from './TotalCommande';
import TotalArticleSansStock from './TotalArticleSansStock';
import { companyName } from '../CompanyInfo/CompanyInfo';

const Dashboard = () => {
  document.title = `Tableau de Bord | ${companyName} `;

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid={true}>
          <Breadcrumbs
            title='Administrateur'
            breadcrumbItem='Tabelau de Bord'
          />

          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Row>
              <Col sm={6} lg={4}>
                {/* Total Article */}
                <TotalProduit />
              </Col>
              <Col sm={6} lg={4}>
                {/* Total TotalArticleSansStock */}
                <TotalArticleSansStock />
              </Col>
              <Col sm={6} lg={4}>
                {/* Total Fournisseurs */}

                <TotalFounisseurs />
              </Col>

              <Col sm={6} lg={4}>
                {/* Total Traitements */}

                <TotalCommande />
              </Col>
            </Row>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* <Row style={{ margin: '50px auto' }}>
              <Col xl={8}>
                <BarChartDataRaportsTraitement />
              </Col>

              <Col xl={4}>
                <SelectedMounthTotalTraitement />
              </Col>
            </Row> */}
          </motion.div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
