import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useAllCommandes, useDeleteCommande } from '../../Api/queriesCommande';
import { useNavigate } from 'react-router-dom';

export default function CommandeListe() {
  // Afficher toutes les commandes
  const { data: commandes, isLoading, error } = useAllCommandes();
  const { mutate: deleteCommandeAndRestorStock } = useDeleteCommande();

  // State de chargement pour la suppression
  const [isDeleting, setIsDeletting] = useState(false);

  // Annuler une Ordonnance
  const navigate = useNavigate();

  // Navigation ver la FACTURE avec ID de Paiement
  const handleCommandeClick = (id) => {
    navigate(`/facture/${id}`);
  };

  // ---------------------------
  // Fonction pour exeuter l'annulation de la décrementation des stocks
  function deleteCommande(comm) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ms-2',
        cancelButton: 'btn btn-danger me-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: `Attention après l'Annulation les produits seront ajouter sur votre STOCK !  `,
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
            const payload = {
              commandeId: comm?._id,
              items: comm?.items.map((item) => ({
                produit: item.produit,
                quantity: item.quantity,
              })),
            };

            // --------------------------------
            setIsDeletting(true);
            // Exécuter l'annulation
            deleteCommandeAndRestorStock(payload, {
              onSuccess: () => {
                setIsDeletting(false);
                swalWithBootstrapButtons.fire({
                  title: 'Succès!',
                  text: `Commande Annulé avec succès les produits sont ajouté sur le STOCK.`,
                  icon: 'success',
                });
              },
              onError: (e) => {
                setIsDeletting(false);
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
            setIsDeletting(false);
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
          setIsDeletting(false);
          swalWithBootstrapButtons.fire({
            title: 'Commande non Annulée',
            icon: 'error',
          });
        }
      });
  }
  // ------------------------------------------------------------

  const [searchTerm, setSearchTerm] = useState('');
  const [todayCommande, setTodayCommande] = useState(false);
  const [delivredCommande, setDelivredCommande] = useState(false);
  const [notDelivredCommande, setNotdelivredCommande] = useState(false);
  // Fonction de Recherche dans la barre de recherche
  const filterCommandes = commandes?.commandesListe
    ?.filter((comm) => {
      const search = searchTerm.toLowerCase();
      return (
        comm?.fullName.toLowerCase().includes(search) ||
        comm?.phoneNumber.toString().includes(search) ||
        comm?.adresse.toLowerCase().includes(search) ||
        comm?.items?.length.toString().includes(search) ||
        comm?.statut.toLowerCase().includes(search) ||
        new Date(comm?.commandeDate || comm?.createdAt)
          .toLocaleDateString('fr-FR')
          .includes(search)
      );
    })

    ?.filter((item) => {
      if (todayCommande) {
        return (
          new Date(item?.createdAt).toLocaleDateString() ===
          new Date().toLocaleDateString()
        );
      }
      return true;
    })
    ?.filter((item) => {
      if (delivredCommande) {
        return item.statut.toLowerCase() === 'en cours';
      }
      return true;
    })
    ?.filter((item) => {
      if (notDelivredCommande) {
        return item.statut.toLowerCase() === 'en attente';
      }
      return true;
    });

  // Total Commandes Livrés
  const totalCommandesLivres = filterCommandes?.filter(
    (comm) => comm?.statut.toLowerCase() === 'livré'
  )?.length;

  // Commande en Attente
  const commandesEnAttente = filterCommandes?.filter((comm) => {
    return comm?.statut.toLowerCase() === 'en attente';
  });

  // Commande en Cours
  const commandesEnCours = filterCommandes?.filter(
    (comm) => comm?.statut.toLowerCase() === 'en cours'
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs
            title='Commande'
            breadcrumbItem='Historique des Commandes'
          />
          {/* -------------------------- */}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='commandeList'>
                    <div
                      className='search-box me-2 d-flex align-items-center gap-2'
                      style={{ width: '200px' }}
                    >
                      {searchTerm !== '' && (
                        <Button
                          color='danger'
                          onClick={() => setSearchTerm('')}
                        >
                          <i className='fas fa-window-close'></i>
                        </Button>
                      )}
                      <input
                        type='text'
                        className='form-control search border border-dark rounded'
                        placeholder='Rechercher...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4'>
                    <div className='d-flex flex-column justify-content-center align-items-center gap-2 text-warning'>
                      <label className='form-check-label' htmlFor='filterToday'>
                        Commande d'Aujourd'hui
                      </label>{' '}
                      <input
                        type='checkbox'
                        className='form-check-input'
                        id='filterToday'
                        onChange={() => setTodayCommande(!todayCommande)}
                      />
                    </div>
                    <div className='d-flex flex-column justify-content-center align-items-center gap-2 text-warning'>
                      <label
                        className='form-check-label'
                        htmlFor='filterDelivredCommande'
                      >
                        Commandes En Cours
                      </label>{' '}
                      <input
                        type='checkbox'
                        className='form-check-input'
                        id='filterDelivredCommande'
                        onChange={() => setDelivredCommande(!delivredCommande)}
                      />
                    </div>
                    <div className='d-flex flex-column justify-content-center align-items-center gap-2 text-warning'>
                      <label
                        className='form-check-label'
                        htmlFor='filterNotDelivredCommande'
                      >
                        Commande En Attente
                      </label>
                      <input
                        type='checkbox'
                        className='form-check-input'
                        id='filterNotDelivredCommande'
                        onChange={() =>
                          setNotdelivredCommande(!notDelivredCommande)
                        }
                      />
                    </div>

                    <Row className='mt-4'>
                      <Col>
                        <h6 className='text-center font-size-15 mt-2'>
                          Commande Enregistrée:{' '}
                          <span className='text-info font-size-18'>
                            {' '}
                            {formatPrice(totalCommandesLivres)}
                          </span>
                        </h6>
                      </Col>

                      <Col>
                        <h6 className='text-center font-size-15 mt-2'>
                          Commande En Cours:{' '}
                          <span className='text-info font-size-18'>
                            {' '}
                            {formatPrice(commandesEnCours?.length)}
                          </span>
                        </h6>
                      </Col>
                      <Col>
                        <h6 className='text-center font-size-15 mt-2'>
                          Commande En Attente:{' '}
                          <span className='text-danger font-size-18'>
                            {' '}
                            {formatPrice(commandesEnAttente?.length)}
                          </span>
                        </h6>
                      </Col>
                    </Row>

                    {error && (
                      <div className='text-danger text-center'>
                        Erreur de chargement des données
                      </div>
                    )}
                    {isLoading && <LoadingSpiner />}

                    <div className='table-responsive table-card mt-3 mb-1'>
                      {filterCommandes?.length === 0 && (
                        <div className='text-center text-mutate'>
                          Aucune commande pour le moment !
                        </div>
                      )}
                      {!error && !isLoading && filterCommandes?.length > 0 && (
                        <table
                          className='table align-middle table-nowrap table-hover'
                          id='commandeTable'
                        >
                          <thead className='table-light'>
                            <tr>
                              <th scope='col' style={{ width: '50px' }}>
                                <i className='fas fa-dollar-sign text-warning'></i>
                              </th>
                              <th scope='col' style={{ width: '50px' }}>
                                Date de Commande
                              </th>
                              <th className='sort' data-sort='fullName'>
                                Client
                              </th>
                              <th className='sort' data-sort='phoneNumber'>
                                Téléphone
                              </th>
                              <th className='sort' data-sort='adresse'>
                                Adresse de Livraison
                              </th>
                              <th className='sort' data-sort='items'>
                                Article
                              </th>
                              <th className='sort' data-sort='statut'>
                                Statut
                              </th>

                              <th className='sort' data-sort='action'>
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className='list form-check-all text-center'>
                            {filterCommandes?.length > 0 &&
                              filterCommandes?.map((comm) => (
                                <tr key={comm?._id}>
                                  <th scope='row'>
                                    {commandes?.factures?.some(
                                      (fact) =>
                                        fact?.commande?._id === comm?._id
                                    ) ? (
                                      <i className='fas fa-check-circle text-success'></i>
                                    ) : (
                                      <i className='fas fa-times-circle text-danger'></i>
                                    )}{' '}
                                  </th>
                                  <th scope='row'>
                                    {new Date(
                                      comm?.commandeDate ?? comm?.createdAt
                                    ).toLocaleDateString('fr-Fr', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                    })}
                                  </th>
                                  <td>{capitalizeWords(comm?.fullName)}</td>
                                  <td>
                                    {formatPhoneNumber(comm?.phoneNumber) ||
                                      '------'}
                                  </td>
                                  <td>{capitalizeWords(comm?.adresse)}</td>

                                  <td>
                                    {comm?.items?.length} acticles
                                    {'  '}
                                  </td>
                                  <td>
                                    <span
                                      className={`badge badge-soft-${
                                        comm?.statut === 'livré'
                                          ? 'success'
                                          : 'warning'
                                      }
                                         text-uppercase`}
                                    >
                                      {comm?.statut}
                                    </span>
                                  </td>

                                  <td>
                                    {isDeleting && <LoadingSpiner />}
                                    {!isDeleting && (
                                      <div className='d-flex gap-2'>
                                        <div className='show-details'>
                                          <button
                                            className='btn btn-sm btn-info show-item-btn'
                                            data-bs-toggle='modal'
                                            data-bs-target='#showdetails'
                                            onClick={() => {
                                              handleCommandeClick(comm?._id);
                                            }}
                                          >
                                            <i className=' bx bx-show-alt text-white'></i>
                                          </button>
                                        </div>
                                        <div className='d-flex gap-2'>
                                          <div className='edit'>
                                            <button
                                              className='btn btn-sm btn-success edit-item-btn'
                                              onClick={() => {
                                                navigate(
                                                  `/updateCommande/${comm?._id}`
                                                );
                                              }}
                                            >
                                              <i className='ri-pencil-fill text-white'></i>
                                            </button>
                                          </div>
                                          <div className='remove'>
                                            <button
                                              className='btn btn-sm btn-danger remove-item-btn'
                                              data-bs-toggle='modal'
                                              data-bs-target='#deleteRecordModal'
                                              onClick={() => {
                                                deleteCommande(comm);
                                              }}
                                            >
                                              <i className='ri-delete-bin-fill text-white'></i>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
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
