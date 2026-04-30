import React, { useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import {
  useAllApprovisonnement,
  useCancelApprovisonnement,
  useDeleteApprovisonnement,
} from '../../Api/queriesApprovisonnement';
import Swal from 'sweetalert2';

export default function ApprovisonnementListe() {
  /**
   * APPROVISIONNEMENTS - Pagination + recherche serveur (pro)
   *
   * Avant:
   * - Chargement complet de tous les approvisionnements + filtre côté navigateur
   * - Problèmes: RAM / lenteur / recherche limitée au dataset déjà chargé
   *
   * Maintenant:
   * - On active le mode backend `paged=1` via query params (même endpoint)
   * - La recherche est faite côté serveur => couvre toutes les données
   * - React Query garde un cache + `keepPreviousData` => pagination fluide
   */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Annuler une APPROVISONNEMENT
  const { mutate: cancelApprovisonnement } = useCancelApprovisonnement();

  // Supprimer une approvisonnement
  const { mutate: deleteApprovisonnement } = useDeleteApprovisonnement();

  // State de chargement pour le Bouton
  const [isDeleting, setIsDeleting] = useState(false);

  // State de navigation
  const navigate = useNavigate();

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce (évite spam réseau) + reset page quand la recherche change
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Récupérer la liste paginée (serveur)
  const {
    data: approvisonnementData,
    isLoading,
    error,
  } = useAllApprovisonnement({
    paged: 1,
    page,
    limit,
    q: debouncedSearch,
  });

  const approvisonnementItems = approvisonnementData?.items || [];
  const totalApprovisonnements = approvisonnementData?.total ?? 0;
  const totalPages = approvisonnementData?.totalPages ?? 1;

  // ---------------------------
  // Fonction pour exeuter l'annulation de la décrementation des stocks
  function handleCancelApprovisonnement(appro) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ms-2',
        cancelButton: 'btn btn-danger me-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: `Attention ${appro?.quantity} quantité sera soustraire de votre STOCK !  `,
        text: 'Voulez-vous continuer ?',
        icon: 'question',
        iconColor: 'red',
        showCancelButton: true,
        confirmButtonText: 'Oui, Continuer',
        cancelButtonText: 'Non',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          try {
            // --------------------------------
            // Exécuter l'annulation
            setIsDeleting(true);
            cancelApprovisonnement(appro?._id, {
              onSuccess: () => {
                setIsDeleting(false);
                swalWithBootstrapButtons.fire({
                  title: 'Succès!',
                  text: `Approvisionnement Annulé avec succès STOCK rétabli.`,
                  icon: 'success',
                });
                navigate('/produits');
              },
              onError: (e) => {
                setIsDeleting(false);
                swalWithBootstrapButtons.fire({
                  title: 'Erreur',
                  text:
                    e?.response?.data?.message ||
                    'Une erreur est survenue lors de la suppression.',
                  icon: 'error',
                });
              },
            });
          } catch (e) {
            setIsDeleting(false);
            swalWithBootstrapButtons.fire({
              title: 'Erreur',
              text:
                e ||
                e?.response?.data?.message ||
                "Une erreur est survenue lors de l'Annulation.",
              icon: 'error',
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          setIsDeleting(false);
          swalWithBootstrapButtons.fire({
            title: "Echec d'Annulation",
            icon: 'error',
          });
        }
      });
  }
  // ------------------------------------------------------------

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Produits' breadcrumbItem='Approvisionnement' />
          {/* -------------------------- */}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Row className='g-4 mb-3'>
                    <Col>
                      <p className='text-center font-size-15 mt-2'>
                        Approvisionnement Total:{' '}
                        <span className='text-warning'>
                          {' '}
                          {totalApprovisonnements}{' '}
                        </span>
                      </p>
                    </Col>
                    <Col className='col-sm'>
                      <div className='d-flex gap-3 justify-content-sm-end flex-wrap'>
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
                            className='form-control search border border-black rounded'
                            placeholder='Rechercher...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Pagination (en haut) */}
                      {!error && !isLoading && totalPages > 1 && (
                        <div className='d-flex justify-content-sm-end align-items-center gap-2 flex-wrap mt-2'>
                          {/* Même principe:
                            - `d-inline-flex gap-2` => marge entre Précédent et Suivant
                          */}
                          <div
                            className='d-inline-flex gap-2'
                            role='group'
                            aria-label='Pagination approvisionnements'
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
                              onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                              }
                            >
                              <i className='bx bx-chevron-right'></i>
                            </Button>
                          </div>

                          <span className='small fw-semibold text-dark'>
                            Page <span className='badge bg-primary'>{page}</span> /{' '}
                            <span className='badge bg-primary'>{totalPages}</span> ·{' '}
                            <span className='badge bg-info'>{totalApprovisonnements}</span> résultats
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
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>
                  <div id='approvisonnementList'>
                    {error && (
                      <div className='text-danger text-center'>
                        Erreur de chargement des données
                      </div>
                    )}
                    {isLoading && <LoadingSpiner />}

                    <div className='table-responsive table-card mt-3 mb-1'>
                      {!approvisonnementItems?.length &&
                        !isLoading &&
                        !error && (
                          <div className='text-center text-mutate'>
                            Aucune approvisionnement pour le moment !
                          </div>
                        )}
                      {!error &&
                        approvisonnementItems?.length > 0 &&
                        !isLoading && (
                          <table
                            className='table align-middle table-nowrap table-hover'
                            id='approvisonnementTable'
                          >
                            <thead className='table-light'>
                              <tr className='text-center'>
                                <th scope='col' style={{ width: '50px' }}>
                                  Date d'arrivée
                                </th>
                                <th data-sort='marchandise'>Produit</th>
                                <th data-sort='quantity'>Quantité arrivée</th>
                                <th data-sort='price'>Prix d'achat</th>
                                <th data-sort='fournisseur_name'>
                                  Fournisseur
                                </th>

                                <th>Téléphone</th>
                                <th>Adresse</th>

                                <th>Action</th>
                              </tr>
                            </thead>

                            <tbody className='list form-check-all text-center'>
                              {approvisonnementItems?.map((appro) => (
                                <tr key={appro._id} className='text-center'>
                                  <th scope='row'>
                                    {' '}
                                    {new Date(
                                      appro.deliveryDate
                                    ).toLocaleDateString('fr-Fr', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      weekday: 'short',
                                    })}
                                  </th>
                                  <td>
                                    {capitalizeWords(appro?.produit?.name)}
                                  </td>

                                  <td>{formatPrice(appro?.quantity)}</td>
                                  <td>
                                    {formatPrice(appro?.price)}
                                    {' F '}
                                  </td>

                                  <td>
                                    {capitalizeWords(
                                      appro.fournisseur?.firstName
                                    )}{' '}
                                    {capitalizeWords(
                                      appro.fournisseur?.lastName
                                    )}{' '}
                                  </td>

                                  <td>
                                    {formatPhoneNumber(
                                      appro?.fournisseur?.phoneNumber
                                    )}
                                  </td>
                                  <td>
                                    {capitalizeWords(
                                      appro?.fournisseur?.adresse
                                    )}
                                  </td>
                                  <td>
                                    <div className='d-flex gap-2'>
                                      {isDeleting && <LoadingSpiner />}{' '}
                                      {!isDeleting && (
                                        <div className='remove'>
                                          <button
                                            className='btn btn-sm btn-danger remove-item-btn'
                                            onClick={(e) => {
                                              handleCancelApprovisonnement(
                                                appro
                                              );
                                              e.stopPropagation();
                                            }}
                                          >
                                            <i className='ri-delete-bin-fill text-white'></i>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
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
}
