import React from 'react';
import {
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Col,
  Container,
  Row,
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { comImg, companyName, rechargeImg } from '../CompanyInfo/CompanyInfo';
import { motion } from 'framer-motion';
import { useAllCommandes } from '../../Api/queriesCommande';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpiner from '../components/LoadingSpiner';
import BackButton from '../components/BackButton';
import { useAllProduit } from '../../Api/queriesProduits';
import { useAllDevis } from '../../Api/queriesDevis';
import { useGetOneUser } from '../../Api/queriesAuth';
import { formatPrice } from '../components/capitalizeFunction';

export default function ProfileDetail() {
  document.title = `Details du Profile | ${companyName} `;
  const selectedUser = useParams();
  const navigate = useNavigate();

  const { data: selectedUserInfos } = useGetOneUser(selectedUser.id);

  const {
    data: commandeData,
    isLoading: loadingCommande,
    error: commandeError,
  } = useAllCommandes();

  const {
    data: products,
    isLoading: loadingProducts,
    isError: productError,
  } = useAllProduit();

  const {
    data: devisData,
    isLoading: loadingDevis,
    isError: devisError,
  } = useAllDevis();

  function getUserCommandes() {
    const userCommandes = commandeData?.commandesListe?.filter(
      (item) => item.user._id === selectedUser.id
    );
    const commandesDelivred = userCommandes?.filter(
      (item) => item.statut === 'livré'
    );

    const commandeNotDelivred = userCommandes?.filter(
      (item) => item.statut === 'en cours'
    );

    const commandesStoped = userCommandes?.filter(
      (item) => item.statut === 'en attente'
    );

    return {
      userCommandes,
      commandesDelivred,
      commandeNotDelivred,
      commandesStoped,
    };
  }
  const selectedUserData = getUserCommandes();

  const selectedUserProducts = products?.filter(
    (item) => item.user._id === selectedUser.id
  );

  const selectedUserPaiements = commandeData?.factures?.filter(
    (item) => item.user._id === selectedUser.id
  );

  const totalToPay = selectedUserData?.userCommandes?.reduce(
    (total, commande) => total + commande.totalAmount,
    0
  );

  const totalPaiements = selectedUserPaiements?.reduce(
    (total, paiement) => total + paiement.totalAmount,
    0
  );

  const selectedUserDevis = devisData?.filter(
    (item) => item.user._id === selectedUser.id
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid={true}>
          <Breadcrumbs title='Profile' breadcrumbItem='Details du Profile' />
          <BackButton />

          <Card className='text-center py-3'>
            <CardTitle className='mb-4'>Détails du Profile</CardTitle>

            <CardText>
              Nom et Prénom :{' '}
              <strong className='text-secondary font-size-19 text-uppercase'>
                {selectedUserInfos?.name}
              </strong>
            </CardText>

            {selectedUserInfos?.boutique > 0 && (
              <CardText>
                {' '}
                Boutique N° :{' '}
                <span className='text-info font-size-16'>
                  {formatPrice(selectedUserInfos?.boutique)}
                </span>
              </CardText>
            )}
          </Card>
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Row>
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/produits')}
                style={{ cursor: 'pointer' }}
              >
                {loadingProducts && <LoadingSpiner />}
                {!productError && !loadingProducts && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #03045e',
                    }}
                  >
                    <CardImg
                      src={comImg}
                      alt='Commandes'
                      style={{ height: '90px', objectFit: 'contain' }}
                    />
                    <CardBody>
                      <CardTitle className='text-center'>
                        <span className='text-light font-size-18'>
                          {selectedUserProducts?.length}
                        </span>
                        <p className='text-light'>Produits Enregistrées</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>

              {/* Paiements */}
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/paiements')}
                style={{ cursor: 'pointer' }}
              >
                {loadingCommande && <LoadingSpiner />}
                {!commandeError && !loadingCommande && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #0077b6',
                    }}
                  >
                    <CardBody className='d-flex flex-column justify-content-center align-items-center gap-3'>
                      <i
                        className='fas fa-dollar-sign text-success mx-auto'
                        style={{ fontSize: '35px' }}
                      ></i>
                      <CardTitle className='text-center '>
                        <span className='text-light font-size-18'>
                          {formatPrice(totalPaiements)} F
                        </span>
                        <p className='text-light'>Encaissé</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/paiements')}
                style={{ cursor: 'pointer' }}
              >
                {loadingCommande && <LoadingSpiner />}
                {!commandeError && !loadingCommande && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #7209b7',
                    }}
                  >
                    <CardBody className='d-flex flex-column justify-content-center align-items-center gap-3'>
                      <i
                        className='fas fa-euro-sign text-danger mx-auto'
                        style={{ fontSize: '35px' }}
                      ></i>
                      <CardTitle className='text-center '>
                        <span className='text-danger font-size-18'>
                          {formatPrice(totalToPay - totalPaiements)} F
                        </span>
                        <p className='text-light'>Non Encaisseé</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>

              {/* Devis */}

              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/devis')}
                style={{ cursor: 'pointer' }}
              >
                {loadingDevis && <LoadingSpiner />}
                {!devisError && !loadingDevis && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #4361ee',
                    }}
                  >
                    <CardImg
                      src={comImg}
                      alt='Commandes'
                      style={{ height: '90px', objectFit: 'contain' }}
                    />
                    <CardBody>
                      <CardTitle className='text-center'>
                        <span className='text-light fs-5'>
                          {selectedUserDevis?.length}
                        </span>
                        <p className='text-light'>Devis Enregistrées</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>

              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/commandes')}
                style={{ cursor: 'pointer' }}
              >
                {loadingCommande && <LoadingSpiner />}
                {!commandeError && !loadingCommande && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #264653',
                    }}
                  >
                    <CardBody className='d-flex flex-column justify-content-center align-items-center gap-3'>
                      <i
                        className='fas fa-check text-primary mx-auto'
                        style={{ fontSize: '35px' }}
                      ></i>
                      <CardTitle className='text-center'>
                        <span className='text-light fs-5'>
                          {selectedUserData?.commandesDelivred?.length}
                        </span>
                        <p className='text-light'>Commandes Enregistrées</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/commandes')}
                style={{ cursor: 'pointer' }}
              >
                {loadingCommande && <LoadingSpiner />}
                {!commandeError && !loadingCommande && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #390099',
                    }}
                  >
                    <CardImg
                      src={rechargeImg}
                      alt='Commandes'
                      style={{ height: '90px', objectFit: 'contain' }}
                    />
                    <CardBody>
                      <CardTitle className='text-center'>
                        <span className='text-warning fs-5'>
                          {selectedUserData?.commandeNotDelivred?.length}
                        </span>
                        <p className='text-light'>Commandes en Cours</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/commandes')}
                style={{ cursor: 'pointer' }}
              >
                {loadingCommande && <LoadingSpiner />}
                {!commandeError && !loadingCommande && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #03045e',
                    }}
                  >
                    <CardBody className='d-flex flex-column justify-content-center align-items-center gap-3'>
                      <i
                        className='fas fa-car text-danger mx-auto'
                        style={{ fontSize: '35px' }}
                      ></i>
                      <CardTitle className='text-center'>
                        <span className='text-danger fs-5'>
                          {selectedUserData?.commandesStoped?.length}
                        </span>
                        <p className='text-light'>Commandes en Attente</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>
            </Row>
          </motion.div>
        </Container>
      </div>
    </React.Fragment>
  );
}
