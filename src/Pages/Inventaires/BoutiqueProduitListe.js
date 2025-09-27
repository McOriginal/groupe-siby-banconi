import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import FormModal from '../components/FormModal';

import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';

import defaultImg from './../../assets/images/no_image.png';
// import ProduitForm from './ProduitForm';
import { useAllProduit } from '../../Api/queriesProduits';
import { connectedUserEmail } from '../Authentication/userInfos';
import ProduitVerificationForm from './ProduitVerificationForm';
import { useNavigate } from 'react-router-dom';

export default function BoutiqueProduitListe() {
  const [form_modal, setForm_modal] = useState(false);
  const { data: produits, isLoading, error } = useAllProduit();
  const [selectedProd, setSelectedProd] = useState(null);
  const navigate = useNavigate();
  // Recherche State
  const [searchTerm, setSearchTerm] = useState('');

  // Fontion pour Rechercher
  const filterSearchProduits = produits?.filter((prod) => {
    const search = searchTerm.toLowerCase();

    return (
      prod?.stock > 0 &&
      (prod?.name?.toLowerCase().includes(search) ||
        prod?.stock?.toString().includes(search) ||
        prod?.price?.toString().includes(search))
    );
  });

  function tog_form_modal() {
    setForm_modal(!form_modal);
  }

  const sumTotalAchatPrice = filterSearchProduits?.reduce((value, item) => {
    return (value += item?.achatPrice * item?.stock);
  }, 0);

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Produits' breadcrumbItem='Liste de Produits' />

          {/* -------------------------- */}
          <FormModal
            form_modal={form_modal}
            setForm_modal={setForm_modal}
            tog_form_modal={tog_form_modal}
            modal_title={'Vérification de Stock'}
            size='md'
            bodyContent={
              <ProduitVerificationForm
                selectedProduct={selectedProd}
                tog_form_modal={tog_form_modal}
              />
            }
          />

          {/* -------------------------- */}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='produitsList'>
                    <div className='d-flex justify-content-between align-items-center flex-wrap gab-2 mb-3'>
                      <Button
                        color='info'
                        onClick={() =>
                          navigate('/inventaires_historique_liste')
                        }
                      >
                        Historique de vérification
                      </Button>
                      <div>
                        <div className='d-flex justify-content-sm-end gap-2'>
                          {searchTerm !== '' && (
                            <Button
                              color='danger'
                              onClick={() => setSearchTerm('')}
                            >
                              <i className='fas fa-window-close'></i>
                            </Button>
                          )}
                          <div className='search-box me-4'>
                            <input
                              type='text'
                              className='form-control search border border-dark rounded'
                              placeholder='Rechercher...'
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Col className='d-flex flex-column justify-content-center align-items-center'>
                      <p className='text-center font-size-15 mt-2'>
                        Produit Enregistrées:{' '}
                        <span className='text-warning text-bold'>
                          {' '}
                          {filterSearchProduits?.length}{' '}
                        </span>
                      </p>
                      {connectedUserEmail === 'tandiadiaby186@gmail.com' && (
                        <p className='text-center font-size-15 mt-2'>
                          Valeur de Boutique:{' '}
                          <span className='text-success text-bold'>
                            {' '}
                            {formatPrice(sumTotalAchatPrice)}
                            {' F '}
                          </span>
                        </p>
                      )}
                    </Col>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <div className='d-flex justify-content-center align-items-center gap-4 flex-wrap'>
            {isLoading && <LoadingSpiner />}
            {error && (
              <div className='text-danger text-center'>
                Erreur lors de chargement des données
              </div>
            )}
            {!error && !isLoading && filterSearchProduits?.length === 0 && (
              <div className='text-center'>Aucun Produit trouvés</div>
            )}
            {!error &&
              !isLoading &&
              filterSearchProduits?.length > 0 &&
              filterSearchProduits?.map((prod, index) => (
                <Card
                  key={index}
                  style={{
                    boxShadow: '0px 0px 10px rgba(121,3,105,0.5)',
                    borderRadius: '15px',
                    padding: '10px 20px',
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    position: 'relative',
                    width: '210px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectedProd(prod);
                    tog_form_modal();
                  }}
                >
                  <CardText
                    style={{
                      position: 'absolute',
                      top: '5%',
                      left: '5%',
                    }}
                  >
                    {formatPrice(prod?.achatPrice)} F
                  </CardText>
                  <img
                    className='img-fluid'
                    style={{
                      borderRadius: '15px 15px 0 0',
                      height: '100px',
                      width: '60%',
                      objectFit: 'contain',
                    }}
                    src={prod?.imageUrl ? prod?.imageUrl : defaultImg}
                    alt={prod?.name}
                  />

                  <CardBody>
                    <CardText
                      className='fs-6 text-center'
                      style={{ width: '200px' }}
                    >
                      {capitalizeWords(prod?.name)}
                    </CardText>

                    <CardTitle className='text-center'>
                      {formatPrice(prod?.price)} F
                    </CardTitle>
                    <CardTitle className='text-center'>
                      Stock:
                      {prod?.stock >= 10 ? (
                        <span style={{ color: 'gray' }}>
                          {' '}
                          {formatPrice(prod?.stock)}
                        </span>
                      ) : (
                        <span className='text-danger'>
                          {' '}
                          {formatPrice(prod?.stock)}
                        </span>
                      )}
                    </CardTitle>
                  </CardBody>
                </Card>
              ))}
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
