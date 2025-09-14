import React, { useContext } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';

// Formik Validation

//redux

import withRouter from '../../components/Common/withRouter';

//Import Breadcrumb
import Breadcrumb from '../../components/Common/Breadcrumb';

import {
  connectedUserEmail,
  connectedUserName,
  connectedUserRole,
} from './userInfos';
import { AuthContext } from '../../Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { companyLogo, companyName } from '../CompanyInfo/CompanyInfo';
// actions

const UserProfile = () => {
  document.title = `Profile | ${companyName} `;

  const navigate = useNavigate();

  const { logout } = useContext(AuthContext);

  // Inside your component

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumb title='Utilisateur' breadcrumbItem='Profile' />

          <Row>
            <Col md='8' className='mx-auto'>
              <Card>
                <CardBody>
                  <div className='d-flex align-items-center justify-content-around flex-column gap-3 p-3'>
                    <div
                      className='ms-3'
                      style={{ width: '80px', height: '80px' }}
                    >
                      <img
                        src={companyLogo}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        alt=''
                        className='avatar-md rounded-circle img-thumbnail'
                      />
                    </div>
                    <div className='text-center'>
                      <div className='text-muted'>
                        <h5> {connectedUserName}</h5>
                        <p className='mb-1'>{connectedUserEmail}</p>
                        <h5 className='text-warning'>
                          {' '}
                          Rôle:{' '}
                          {connectedUserRole === 'admin'
                            ? 'Administrateur'
                            : 'Utilisateur'}{' '}
                        </h5>
                      </div>
                    </div>

                    <div className='mt-4 d-flex flex-wrap gap-4'>
                      {connectedUserRole === 'admin' && (
                        <Button
                          color='info'
                          onClick={() => navigate('/register')}
                        >
                          Créer un Compte
                        </Button>
                      )}
                      <Button
                        color='info'
                        onClick={() => navigate('/usersProfileListe')}
                      >
                        Liste des Profile
                      </Button>
                      <Button
                        color='warning'
                        onClick={() => navigate('/updatePassword')}
                      >
                        Changer mon mot de passe
                      </Button>

                      <Button color='danger' onClick={() => logout()}>
                        Déconnecter
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(UserProfile);
