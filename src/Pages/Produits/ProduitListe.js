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

import { deleteButton } from '../components/AlerteModal';
import defaultImg from './../../assets/images/no_image.png';
import { useNavigate } from 'react-router-dom';
import ProduitForm from './ProduitForm';
import { useAllProduit, useDeleteProduit } from '../../Api/queriesProduits';
import {
  connectedUserEmail,
  connectedUserRole,
} from '../Authentication/userInfos';

export default function ProduitListe() {
  const [form_modal, setForm_modal] = useState(false);
  /**
   * PAGINATION + RECHERCHE (mode pro)
   *
   * Avant:
   * - On chargeait TOUTES les données (`getAllProduits`) puis on filtrait en JS.
   * - Problèmes:
   *   - RAM navigateur + lenteur
   *   - recherche non scalable (plus il y a de produits, plus c'est lourd)
   *
   * Maintenant:
   * - On utilise le mode backend `paged=1` (même endpoint, juste des query params).
   * - La recherche est côté serveur => elle couvre "toutes les données".
   * - On garde un cache React Query + `keepPreviousData` pour un UX fluide.
   */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const { mutate: deleteProduit, isLoading: isDeletingProduct } =
    useDeleteProduit();
  const [produitToUpdate, setProduitToUpdate] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState('Ajouter un Produit');

  // Recherche State
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Débounce "pro" côté front:
   * - évite de déclencher un appel réseau à chaque frappe
   * - donne une sensation plus fluide
   *
   * NOTE:
   * - On n'introduit pas une nouvelle dépendance; on fait un debounce simple.
   */
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      // Quand la recherche change, on revient à la page 1 pour éviter une page vide.
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const {
    data: produits,
    isLoading,
    error,
  } = useAllProduit({
    paged: 1,
    page,
    limit,
    q: debouncedSearch,
    // Conserve votre logique "page Produits = seulement en stock"
    // (anciennement: `prod.stock > 0` côté front)
    stockGt: 0,
  });

  // Données paginées: `items` contient seulement la page courante.
  const produitsItems = produits?.items || [];
  const totalProduits = produits?.total ?? 0;
  const totalPages = produits?.totalPages ?? 1;

  // Utilisation de useNavigate pour la navigation
  const navigate = useNavigate();
  // Function to handle deletion of a medicament
  function navigateToProduitApprovisonnement(id) {
    navigate(`/approvisonnement/${id}`);
  }

  function tog_form_modal() {
    setForm_modal(!form_modal);
  }

  /**
   * Valeur de boutique (global):
   * - Avant: calcul côté front sur TOUTE la liste (très coûteux).
   * - Maintenant: le backend calcule `totals.sumTotalAchatPrice` via aggregation
   *   (sur toutes les données filtrées, pas uniquement la page).
   */
  const sumTotalAchatPrice = produits?.totals?.sumTotalAchatPrice ?? 0;

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
            modal_title={formModalTitle}
            size='md'
            bodyContent={
              <ProduitForm
                produitToEdit={produitToUpdate}
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
                      {connectedUserRole === 'admin' && (
                        <div className='col-sm-auto'>
                          <div className='d-flex gap-1'>
                            <Button
                              color='info'
                              className='add-btn'
                              id='create-btn'
                              onClick={() => {
                                setProduitToUpdate(null);
                                tog_form_modal();
                              }}
                            >
                              <i className='mdi mdi-sitemap align-center me-1'></i>{' '}
                              Ajouter un Produit
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
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

                        {/* ---------------- PAGINATION (en haut) ----------------
                          Design:
                          - Boutons compacts en "btn-group"
                          - Responsive: flex-wrap + gap
                          - Infos: page/totalPages + total résultats
                          Pourquoi en haut:
                          - L'utilisateur voit et contrôle la pagination sans scroller
                        */}
                        {!error && !isLoading && totalPages > 1 && (
                          <div className='d-flex justify-content-sm-end align-items-center gap-2 flex-wrap mt-2'>
                            {/* NOTE UI:
                              - On remplace `btn-group` par `d-inline-flex gap-2`
                              - Objectif: ajouter une marge/espacement visible entre "Précédent" et "Suivant"
                            */}
                            <div className='d-inline-flex gap-2' role='group' aria-label='Pagination produits'>
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
                      </div>
                    </div>
                    <Col className='d-flex flex-column justify-content-center align-items-center'>
                      <p className='text-center font-size-15 mt-2'>
                        Produit Enregistrées:{' '}
                        <span className='text-warning text-bold'>
                          {' '}
                          {totalProduits}{' '}
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
            {!error && !isLoading && produitsItems?.length === 0 && (
              <div className='text-center'>Aucun Produit trouvés</div>
            )}
            {!error &&
              !isLoading &&
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
                  {connectedUserRole === 'admin' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '5%',
                        right: '5%',
                      }}
                    >
                      {isDeletingProduct && <LoadingSpiner />}

                      {!isDeletingProduct && (
                        <UncontrolledDropdown className='dropdown d-inline-block'>
                          <DropdownToggle
                            className='btn btn-soft-secondary btn-sm'
                            tag='button'
                          >
                            <i className='bx bx-caret-down-square fs-2 text-info'></i>
                          </DropdownToggle>
                          <DropdownMenu className='dropdown-menu-end'>
                            <DropdownItem
                              className='edit-item-btn  text-secondary'
                              onClick={() => {
                                setFormModalTitle('Modifier les données');
                                setProduitToUpdate(prod);
                                tog_form_modal();
                              }}
                            >
                              <i className='ri-pencil-fill align-bottom me-2 '></i>
                              Modifier
                            </DropdownItem>
                            <DropdownItem
                              className='edit-item-btn text-warning'
                              onClick={() => {
                                navigateToProduitApprovisonnement(prod?._id);
                              }}
                            >
                              <i className='bx bx-analyse align-bottom me-2 '></i>
                              Approvisionner
                            </DropdownItem>

                            <DropdownItem
                              className='remove-item-btn text-danger '
                              onClick={() => {
                                deleteButton(
                                  prod?._id,
                                  prod?.name,
                                  deleteProduit
                                );
                              }}
                            >
                              {' '}
                              <i className='ri-delete-bin-fill align-bottom me-2 '></i>{' '}
                              Supprimer{' '}
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      )}
                    </div>
                  )}
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
