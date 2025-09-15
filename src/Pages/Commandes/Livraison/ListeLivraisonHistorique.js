import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Row,
} from 'reactstrap';
import FormModal from '../../components/FormModal';
import LoadingSpiner from '../../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPrice,
} from '../../components/capitalizeFunction';
import { deleteButton } from '../../components/AlerteModal';
import {
  useAllLivraisonHistorique,
  useDeleteLivraisonHistorique,
} from '../../../Api/queriesLivraisonHistorique';
import LivraisonHistoriqueForm from './LivraisonHistoriqueForm';
import {
  connectedUserBoutique,
  connectedUserRole,
} from '../../Authentication/userInfos';
import FactureLivraison from './FactureLivraison';

export default function LivraisonHistorique({ id, commandeItems }) {
  const [form_modal, setForm_modal] = useState(false);
  // Récupération des Historiques de Livraison Historique
  const {
    data: livraisonHistoriqueData,
    isLoading,
    error,
  } = useAllLivraisonHistorique(id);

  // State pour supprimer le Paiement dans l'historique
  const { mutate: deleteLivraisonHistorique, isDeleting } =
    useDeleteLivraisonHistorique();

  const [livraisonToUpdate, setLivraisonToUpdate] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [facture_modal, setFacture_modal] = useState(false);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [lastLivraisonDate, setLastLivraisonDate] = useState(null);
  // Ouverture de Modal Form
  function tog_form_modal() {
    setForm_modal(!form_modal);
  }

  // Ouverture de Modal Form
  function tog_facture_modal() {
    setFacture_modal(!facture_modal);
  }
  // State de Recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Fonction de Rechercher
  const filterSearchLivraisonHistorique = livraisonHistoriqueData?.filter(
    (livraison) => {
      const search = searchTerm.toLowerCase();
      return (
        livraison?.produit.toLowerCase().includes(search) ||
        (livraison?.quantity || 0).toString().includes(search) ||
        new Date(livraison?.livraisonDate)
          .toLocaleDateString('fr-Fr')
          .includes(search)
      );
    }
  );

  // ------------------------------------------------
  // Calcule de Quantité Commandés et Livrée pour chaque Produit
  const productDelivredResult = commandeItems?.items?.map((commItem) => {
    const livraisonFilter = livraisonHistoriqueData?.filter(
      (livItem) => livItem?.produit === commItem?.produit.name
    );

    const totalQuantityDelivry = livraisonFilter?.reduce(
      (current, value) => (current += value.quantity),
      0
    );

    return {
      produit: commItem?.produit?.name,
      quantityCommandee: commItem?.quantity,
      quantityLivree: totalQuantityDelivry,
      quantityRestante: commItem?.quantity - totalQuantityDelivry,
    };
  });
  // ---------------------------------------
  // ---------------------------------------
  // ---------------------------------------
  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          {/* -------------------------- */}
          <FactureLivraison
            tog_show_modal={setFacture_modal}
            show_modal={facture_modal}
            selectedLivraisonHistoriqueCommandes={selectedLivraison}
            delivredProducts={productDelivredResult}
            lastDelivreDate={lastLivraisonDate}
          />
          <FormModal
            form_modal={form_modal}
            setForm_modal={setForm_modal}
            tog_form_modal={tog_form_modal}
            modal_title={formTitle}
            size='md'
            bodyContent={
              <LivraisonHistoriqueForm
                selectedLivraisonToUpdate={livraisonToUpdate}
                tog_form_modal={tog_form_modal}
              />
            }
          />

          {/* -------------------- */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardTitle className='text-center mb-4 mt-2 font-size-20 '>
                  Historique de Livraison
                </CardTitle>
                <CardBody>
                  <div id='Livraison HistoriqueList'>
                    <Button
                      color='secondary'
                      className='add-btn my-4 text-center d-flex justify-content-center align-items-center'
                      id='create-btn'
                      onClick={() => {
                        setSelectedLivraison(
                          livraisonHistoriqueData[0]?.commande
                        );
                        setLastLivraisonDate(livraisonHistoriqueData[0]);

                        tog_facture_modal();
                      }}
                    >
                      <i className='bx bx-show align-center me-1'></i> Reçue de
                      Livraison
                    </Button>
                    <Row className='g-4 mb-3 justify-content-between align-items-center'>
                      {connectedUserRole === 'admin' &&
                        connectedUserBoutique ===
                          commandeItems?.user?.boutique && (
                          <Col className='col-sm-auto'>
                            <div className='d-flex gap-1'>
                              <Button
                                color='info'
                                className='add-btn'
                                id='create-btn'
                                onClick={() => {
                                  setLivraisonToUpdate(null);
                                  setFormTitle('Ajouter une Livraison');
                                  tog_form_modal();
                                }}
                              >
                                <i className='fas fa-plus align-center me-1'></i>{' '}
                                Ajouter une Livraison
                              </Button>
                            </div>
                          </Col>
                        )}
                      <Col className='col-sm-auto'>
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
                    <div className='col-sm-auto'>
                      {commandeItems?.statut !== 'livré' &&
                        productDelivredResult?.map((item) => (
                          <div key={item?.produit} className='text-center my-2'>
                            <p className='font-size-13'>
                              <strong className='text-muted'>
                                {capitalizeWords(item?.produit)}:{' '}
                              </strong>
                              <span className='text-success'>
                                {' '}
                                {formatPrice(item?.quantityLivree)}
                              </span>{' '}
                              Livré sur{' '}
                              <span className='text-warning'>
                                {' '}
                                {formatPrice(item?.quantityCommandee)}
                              </span>{' '}
                              Commandé
                              <span className='text-danger mx-3'>
                                Restant: {formatPrice(item?.quantityRestante)}
                              </span>{' '}
                            </p>
                          </div>
                        ))}
                    </div>
                    {error && (
                      <div className='text-danger text-center'>
                        Erreur de chargement des données
                      </div>
                    )}
                    {isLoading && <LoadingSpiner />}

                    <div className='table-responsive table-card mt-3 mb-1'>
                      {commandeItems?.statut === 'livré' && (
                        <div className='text-center text-success mt-4'>
                          <strong className='font-size-18'>
                            Commande Livrée !
                          </strong>
                        </div>
                      )}
                      {filterSearchLivraisonHistorique?.length === 0 &&
                        commandeItems?.statut !== 'livré' && (
                          <div className='text-center text-mutate mt-4'>
                            <strong className='font-size-18'>
                              Aucune Livraison !
                            </strong>
                          </div>
                        )}

                      {/* Liste Historique de Paiement si ça existe */}
                      {!error &&
                        !isLoading &&
                        filterSearchLivraisonHistorique?.length > 0 && (
                          <table
                            className='table align-middle  border-all border-2 border-secondary table-nowrap table-hover text-center'
                            id='paiementTable'
                          >
                            <thead className='table-light'>
                              <tr>
                                <th
                                  style={{ width: '50px' }}
                                  data-sort='paiementDate'
                                >
                                  Date de Livraison
                                </th>

                                <th
                                  className='text-center'
                                  data-sort='totaPayer'
                                >
                                  Produit
                                </th>

                                <th>Quantité Livré</th>
                                {connectedUserRole === 'admin' &&
                                  connectedUserBoutique ===
                                    commandeItems?.user?.boutique && (
                                    <th data-sort='action'>Action</th>
                                  )}
                              </tr>
                            </thead>

                            <tbody className='list form-check-all'>
                              {filterSearchLivraisonHistorique?.length > 0 &&
                                filterSearchLivraisonHistorique?.map(
                                  (livraison) => (
                                    <tr key={livraison?._id}>
                                      <th scope='row'>
                                        {new Date(
                                          livraison?.livraisonDate
                                        ).toLocaleDateString()}
                                      </th>

                                      <td>
                                        {capitalizeWords(livraison?.produit)}
                                      </td>

                                      <td>
                                        {formatPrice(livraison?.quantity)}
                                      </td>

                                      {connectedUserRole === 'admin' &&
                                        connectedUserBoutique ===
                                          commandeItems?.user?.boutique && (
                                          <td>
                                            {isDeleting && <LoadingSpiner />}
                                            {!isDeleting && (
                                              <div className='d-flex gap-2 justify-content-center alitgn-items-center'>
                                                <div>
                                                  <button
                                                    className='btn btn-sm btn-warning show-item-btn'
                                                    data-bs-toggle='modal'
                                                    data-bs-target='#showModal'
                                                    onClick={() => {
                                                      setLivraisonToUpdate(
                                                        livraison
                                                      );
                                                      setFormTitle(
                                                        'Modifier la Livraison'
                                                      );
                                                      tog_form_modal();
                                                    }}
                                                  >
                                                    <i className='bx bx-pencil align-center text-white'></i>
                                                  </button>
                                                </div>

                                                <div className='remove'>
                                                  <button
                                                    className='btn btn-sm btn-danger remove-item-btn'
                                                    data-bs-toggle='modal'
                                                    data-bs-target='#deleteRecordModal'
                                                    onClick={() => {
                                                      deleteButton(
                                                        livraison?._id,
                                                        livraison?.produit,
                                                        deleteLivraisonHistorique
                                                      );
                                                    }}
                                                  >
                                                    <i className='ri-delete-bin-fill text-white'></i>
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </td>
                                        )}
                                    </tr>
                                  )
                                )}
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
