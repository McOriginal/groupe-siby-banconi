import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  Row,
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';

import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';

import { useGetTopProduitCommande } from '../../Api/queriesCommande';
import defaultImg from './../../assets/images/no_image.png';

export default function TopProduits() {
  const { data: produits, isLoading, error } = useGetTopProduitCommande();

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs
            title='Produits'
            breadcrumbItem='Produits Les Plus Achetés'
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
                      {/* <Col>
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
                      </Col> */}
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
            {!error && !isLoading && produits?.length === 0 && (
              <div className='text-center'>
                Aucun Produit sans stock pour le moment
              </div>
            )}
            {!error &&
              !isLoading &&
              produits?.length > 0 &&
              produits?.map((prod, index) => (
                <Card
                  key={index}
                  style={{
                    boxShadow: '0px 0px 10px rgba(121,3,105,0.5)',
                    borderRadius: '15px',
                    padding: '10px 20px',
                    width: '210px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '3px dotted #160eb1',
                  }}
                >
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
                      Quantité:
                      <span className='text-success'>
                        {' '}
                        {formatPrice(prod?.totalQuantity)}
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
