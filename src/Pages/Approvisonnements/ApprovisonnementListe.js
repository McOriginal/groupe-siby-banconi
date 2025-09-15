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
import {
  useAllApprovisonnement,
  useCancelApprovisonnement,
  useDeleteApprovisonnement,
} from '../../Api/queriesApprovisonnement';
import Swal from 'sweetalert2';
import {
  connectedUserBoutique,
  connectedUserRole,
} from '../Authentication/userInfos';

export default function ApprovisonnementListe() {
  // Recuperer la Liste des APPROVISONNEMENT
  const {
    data: approvisonnementData,
    isLoading,
    error,
  } = useAllApprovisonnement();

  // Annuler une APPROVISONNEMENT
  const { mutate: cancelApprovisonnement } = useCancelApprovisonnement();

  // Supprimer une approvisonnement
  const { mutate: deleteApprovisonnement } = useDeleteApprovisonnement();
  const [selectedBoutique, setSelectedBoutique] = useState(
    connectedUserBoutique
  );
  // State de chargement pour le Bouton
  const [isDeleting, setIsDeleting] = useState(false);

  // State de navigation
  const navigate = useNavigate();

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Fonction pour la recherche
  const filterSearchApprovisonnement = approvisonnementData
    ?.filter((appro) => {
      const search = searchTerm.toLowerCase();

      return (
        `${appro?.fournisseur?.firstName} ${appro?.fournisseur?.lasttName}`
          .toLowerCase()
          .includes(search) ||
        (appro?.fournisseur?.phoneNumber || '').toString().includes(search) ||
        appro?.fournisseur?.adresse.toLowerCase().includes(search) ||
        appro?.produit?.name.toLowerCase().includes(search) ||
        appro?.quantity.toString().includes(search) ||
        appro?.price.toString().includes(search) ||
        new Date(appro?.delivryDate)
          .toLocaleDateString('fr-Fr')
          .toString()
          .includes(search)
      );
    })
    ?.filter((item) => {
      if (selectedBoutique) {
        return item.user?.boutique === parseInt(selectedBoutique);
      }
      return item.user?.boutique === connectedUserBoutique;
    });

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
                  text: `Approvisonnement Annulé avec succès STOCK rétabli.`,
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
          <Breadcrumbs title='Produits' breadcrumbItem='Approvisonnement' />
          {/* -------------------------- */}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Row className='g-4 mb-3'>
                    <Col className='d-flex gap-2 justify-content-center align-items-center my-3 '>
                      <h6>Boutique </h6>
                      <select
                        value={selectedBoutique}
                        onChange={(e) => setSelectedBoutique(e.target.value)}
                        className='form-select border border-dark rounded '
                        style={{ cursor: 'pointer' }}
                      >
                        <option value=''>Toutes</option>
                        <option value={connectedUserBoutique}>
                          {connectedUserBoutique} - Ma Boutique
                        </option>
                        {connectedUserBoutique === 1 ? (
                          <option value='2'>Boutique - 2</option>
                        ) : connectedUserBoutique === 2 ? (
                          <option value='1'>Boutique - 1</option>
                        ) : (
                          <optgroup label='autres'>
                            <option value='1'>Boutique - 1</option>
                            <option value='2'>Boutique - 2</option>
                          </optgroup>
                        )}
                      </select>
                    </Col>
                    <Col>
                      <p className='text-center font-size-15 mt-2'>
                        Approvisonnement Total:{' '}
                        <span className='text-warning'>
                          {' '}
                          {approvisonnementData?.length}{' '}
                        </span>
                      </p>
                    </Col>
                    <Col className='col-sm'>
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
                      {!filterSearchApprovisonnement?.length &&
                        !isLoading &&
                        !error && (
                          <div className='text-center text-mutate'>
                            Aucune approvisonnement pour le moment !
                          </div>
                        )}
                      {!error &&
                        filterSearchApprovisonnement?.length > 0 &&
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
                              {filterSearchApprovisonnement?.map((appro) => (
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
                                  {connectedUserRole === 'admin' &&
                                    connectedUserBoutique ===
                                      appro.user.boutique && (
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
                                                  handleCancelApprovisonnement(
                                                    appro
                                                  );
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
                                                    deleteApprovisonnement
                                                  );
                                                }}
                                              >
                                                <i className='ri-delete-bin-fill text-white'></i>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    )}
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
