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

import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';

import defaultImg from './../../assets/images/no_image.png';
import { useNavigate } from 'react-router-dom';
import { useAllProduitWithStockInferieure } from '../../Api/queriesProduits';

export default function ProduitSansStock() {
  const {
    data: produits,
    isLoading,
    error,
  } = useAllProduitWithStockInferieure();

  // Recherche State
  const [searchTerm, setSearchTerm] = useState('');

  // Fontion pour Rechercher
  const filterSearchProduits = produits?.filter((prod) => {
    const search = searchTerm.toLowerCase();

    return (
      prod?.name?.toLowerCase().includes(search) ||
      prod?.stock?.toString().includes(search) ||
      prod?.price?.toString().includes(search)
    );
  });

  // Utilisation de useNavigate pour la navigation
  const navigate = useNavigate();
  // Function to handle deletion of a medicament
  function navigateToProduitApprovisonnement(id) {
    navigate(`/approvisonnement/${id}`);
  }

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs
            title='Produits'
            breadcrumbItem='Produits Stock Terminé'
          />

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='produitsList'>
                    <Row className='g-4 mb-3'>
                      <Col>
                        <p className='text-center font-size-15 mt-2'>
                          Produit Total:{' '}
                          <span className='text-warning'>
                            {' '}
                            {produits?.length}{' '}
                          </span>
                        </p>
                      </Col>
                      <Col>
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
                      </Col>
                    </Row>
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
              <div className='text-center'>
                Aucun Produit sans stock pour le moment
              </div>
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
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '5%',
                      right: '5%',
                    }}
                  >
                    <UncontrolledDropdown className='dropdown d-inline-block'>
                      <DropdownToggle
                        className='btn btn-soft-secondary btn-sm'
                        tag='button'
                      >
                        <i className='bx bx-caret-down-square fs-2 text-info'></i>
                      </DropdownToggle>
                      <DropdownMenu className='dropdown-menu-end'>
                        <DropdownItem
                          className='edit-item-btn'
                          onClick={() => {
                            navigateToProduitApprovisonnement(prod?._id);
                          }}
                        >
                          <i className='bx bx-analyse align-bottom me-2 text-muted'></i>
                          Approvisonner
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </div>
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
                      <span className='text-danger'>
                        {' '}
                        {formatPrice(prod?.stock)}
                      </span>
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
