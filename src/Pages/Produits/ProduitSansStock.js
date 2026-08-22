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
  /**
   * PAGINATION + RECHERCHE (stock faible)
   *
   * Avant:
   * - Chargement complet + filtre côté navigateur
   *
   * Maintenant:
   - Mode backend `paged=1` sur le même endpoint
   * - Recherche serveur => couvre toutes les données
   */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  // Recherche State
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce + reset page (même logique que ProduitListe)
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /**
   * IMPORTANT:
   * - On utilise le même hook (même nom) mais avec des params => backend renvoie paginé.
   * - On ne change pas les URLs.
   */
  const {
    data: produitsPaged,
    isLoading: isLoadingPaged,
    error: errorPaged,
  } = useAllProduitWithStockInferieure({
    paged: 1,
    page,
    limit,
    q: debouncedSearch,
    // Optionnel: on garde le seuil backend par défaut (stock < 10)
    stockLt: 10,
  });

  // Données paginées (pro)
  const produitsItems = produitsPaged?.items || [];
  const totalProduits = produitsPaged?.total ?? 0;
  const totalPages = produitsPaged?.totalPages ?? 1;
  const loading = isLoadingPaged;
  const err = errorPaged;

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
                            {totalProduits}{' '}
                          </span>
                        </p>
                      </Col>
                      <Col>
                        <div className='d-flex justify-content-sm-end gap-2 flex-wrap'>
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

                        {/* Pagination (en haut) */}
                        {!err && !loading && totalPages > 1 && (
                          <div className='d-flex justify-content-sm-end align-items-center gap-2 flex-wrap mt-2'>
                            {/* Même principe que ProduitListe:
                              - `d-inline-flex gap-2` => petit espace entre les 2 boutons
                            */}
                            <div
                              className='d-inline-flex gap-2'
                              role='group'
                              aria-label='Pagination produits stock faible'
                            >
                              <Button
                                color='info'
                                className='shadow-sm'
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                              >
                                <i className='bx bx-chevron-left'></i>
                              </Button>
                              <Button
                                color='primary'
                                className='shadow-sm'
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              >
                                <i className='bx bx-chevron-right'></i>
                              </Button>
                            </div>

                            <span className='small fw-semibold text-dark'>
                              Page <span className='badge bg-primary'>{page}</span> /{' '}
                              <span className='badge bg-primary'>{totalPages}</span> ·{' '}
                              <span className='badge bg-info'>{totalProduits}</span> résultats
                            </span>

                            <div className='d-flex align-items-center gap-2'>
                              <span className='text-dark small fw-semibold'>Par page</span>
                              <select
                                className='form-select form-select-sm border border-primary'
                                style={{ width: 95 }}
                                value={limit}
                                onChange={(e) => {
                                  setLimit(Number(e.target.value));
                                  setPage(1);
                                }}
                              >
                                <option value={12}>12</option>
                                <option value={24}>24</option>
                                <option value={48}>48</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <div className='d-flex justify-content-center align-items-center gap-4 flex-wrap'>
            {loading && <LoadingSpiner />}
            {err && (
              <div className='text-danger text-center'>
                Erreur lors de chargement des données
              </div>
            )}
            {!err && !loading && produitsItems?.length === 0 && (
              <div className='text-center'>
                Aucun Produit sans stock pour le moment
              </div>
            )}
            {!err &&
              !loading &&
              produitsItems?.length > 0 &&
              produitsItems?.map((prod, index) => (
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
                          Approvisionner
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
