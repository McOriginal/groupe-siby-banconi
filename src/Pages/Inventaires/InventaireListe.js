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
import { deleteButton } from '../components/AlerteModal';
import Swal from 'sweetalert2';
import {
  useAllInventaire,
  useCancelInventaire,
  useDeleteInventaire,
} from '../../Api/queriesInventaire';

export default function InventaireHistoriqueListe() {
  // Recuperer la Liste des APPROVISONNEMENT
  const { data: inventaireData, isLoading, error } = useAllInventaire();

  // Annuler une APPROVISONNEMENT
  const { mutate: cancelInventaire } = useCancelInventaire();

  // Supprimer une approvisonnement
  const { mutate: deleteInventaire } = useDeleteInventaire();

  // State de chargement pour le Bouton
  const [isDeleting, setIsDeleting] = useState(false);

  // State de navigation
  const navigate = useNavigate();

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Fonction pour la recherche
  const filterSearchInventaire = inventaireData?.filter((item) => {
    const search = searchTerm.toLowerCase();

    return (
      (item?.boutiquer?.name).includes(search) ||
      item?.boutiquer?.email.toLowerCase().includes(search) ||
      item?.produit?.name.toLowerCase().includes(search) ||
      item?.quantity.toString().includes(search) ||
      item?.totalAmount.toString().includes(search) ||
      new Date(item?.inventaireDate)
        .toLocaleDateString('fr-Fr')
        .toString()
        .includes(search)
    );
  });

  // ---------------------------
  // Fonction pour exeuter l'annulation de la décrementation des stocks
  function handleCancelInventaire(appro) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ms-2',
        cancelButton: 'btn btn-danger me-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: `Attention ${appro?.quantity} quantité sera augmenter sur le STOCK !  `,
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
            cancelInventaire(appro?._id, {
              onSuccess: () => {
                setIsDeleting(false);
                swalWithBootstrapButtons.fire({
                  title: 'Succès!',
                  text: `Inventaire Annulé avec succès STOCK rétabli.`,
                  icon: 'success',
                });
                // navigate('/produits');
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
          <Breadcrumbs title='Inventaire' breadcrumbItem='Vérification' />
          {/* -------------------------- */}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Row className='g-4 mb-3'>
                    <Col className='col-sm'>
                      <Button
                        color='info'
                        onClick={() => navigate('/inventaires_produits_liste')}
                      >
                        Fare une vérification
                      </Button>
                      <div className='d-flex gap-3 justify-content-sm-end'>
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
                      {!filterSearchInventaire?.length &&
                        !isLoading &&
                        !error && (
                          <div className='text-center text-mutate'>
                            Aucune vérification inventaire pour le moment !
                          </div>
                        )}
                      {!error &&
                        filterSearchInventaire?.length > 0 &&
                        !isLoading && (
                          <table
                            className='table align-middle table-nowrap table-hover'
                            id='approvisonnementTable'
                          >
                            <thead className='table-light'>
                              <tr className='text-center'>
                                <th scope='col' style={{ width: '50px' }}>
                                  Date
                                </th>
                                <th>Produit</th>
                                <th>Quantité </th>
                                <th>Somme Total</th>
                                <th>Responsable</th>

                                <th>Email</th>

                                <th>Action</th>
                              </tr>
                            </thead>

                            <tbody className='list form-check-all text-center'>
                              {filterSearchInventaire?.map((appro) => (
                                <tr key={appro._id} className='text-center'>
                                  <th scope='row'>
                                    {' '}
                                    {new Date(
                                      appro.inventaireDate
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
                                    {formatPrice(appro?.totalAmount)}
                                    {' F '}
                                  </td>

                                  <td>
                                    {capitalizeWords(appro.boutiquer?.name)}
                                  </td>
                                  <td>{appro.boutiquer?.email}</td>

                                  <td>
                                    <div className='d-flex gap-2'>
                                      {isDeleting && <LoadingSpiner />}{' '}
                                      {!isDeleting && (
                                        <div className='remove'>
                                          <button
                                            className='btn btn-sm btn-warning remove-item-btn'
                                            data-bs-toggle='modal'
                                            data-bs-target='#deleteRecordModal'
                                            onClick={(e) => {
                                              handleCancelInventaire(appro);
                                              e.stopPropagation();
                                            }}
                                          >
                                            Annuler
                                          </button>
                                        </div>
                                      )}
                                      {!isDeleting && (
                                        <div className='remove'>
                                          <button
                                            className='btn btn-sm btn-danger remove-item-btn'
                                            data-bs-toggle='modal'
                                            data-bs-target='#deleteRecordModal'
                                            onClick={() => {
                                              deleteButton(
                                                appro?._id,
                                                appro?.produit?.name,
                                                deleteInventaire
                                              );
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
