import React, { useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { connectedUserBoutique } from '../Authentication/userInfos';

export default function Bilans() {
  const { data: paiementsData, isLoading, error } = useAllPaiements();
  const [show_modal, setShow_modal] = useState(false);

  // State de Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReliqua, setFilterReliqua] = useState(false);
  const [todayPaiement, setTodayPaiement] = useState(false);
  const [selectedBoutique, setSelectedBoutique] = useState(null);

  // Fonction de Rechercher
  const filterSearchPaiement = paiementsData
    ?.filter((paiement) => {
      const search = searchTerm.toLowerCase();
      return (
        `${paiement?.commande?.fullName}`.toLowerCase().includes(search) ||
        paiement?.commande?.adresse.toLowerCase().includes(search) ||
        (paiement?.commande?.phoneNumber || '').toString().includes(search) ||
        paiement?.totalAmount.toString().includes(search) ||
        (paiement?.totalPaye || '').toString().includes(search) ||
        (paiement?.reduction || 0).toString().includes(search) ||
        (
          paiement?.paiementDate &&
          new Date(paiement?.paiementDate).toLocaleDateString()
        ).includes(search)
      );
    })
    ?.filter((item) => {
      if (selectedBoutique !== null) {
        return Number(item.user?.boutique) === selectedBoutique;
      }
      return true;
    })
    ?.filter((paiement) => {
      if (!filterReliqua) return true; // pas de filtre
      const reliqua = (paiement?.totalAmount || 0) - (paiement?.totalPaye || 0);
      return reliqua > 0;
    })
    ?.filter((item) => {
      if (todayPaiement) {
        return (
          new Date(item.paiementDate).toLocaleDateString() ===
          new Date().toLocaleDateString()
        );
      }
      return true;
    });

  // Total de commandes
  const sumTotalAmount = filterSearchPaiement?.reduce((curr, item) => {
    return (curr += item?.totalAmount);
  }, 0);

  // Total Payés
  const sumTotalPaye = filterSearchPaiement?.reduce((curr, item) => {
    return (curr += item?.totalPaye);
  }, 0);

  // Ouverture de Modal Reçu Paiement
  function tog_show_modal() {
    setShow_modal(!show_modal);
  }
  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Transaction' breadcrumbItem='Paiements' />

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='paiementsList'>
                    <Row className='g-4 mb-3 '>
                      <Col className='col-sm-auto '>
                        <div className='d-flex gap-1'>
                          <Button
                            color='info'
                            className='add-btn'
                            id='create-btn'
                          >
                            <i className='fas fa-dollar-sign align-center me-1'></i>{' '}
                            Ajouter un Paiement
                          </Button>
                        </div>
                      </Col>

                      <Col className='col-sm'>
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
                      <Col
                        md='12'
                        className='d-flex justify-content-around mt-4 flex-wrap'
                      >
                        <h6 className=''>
                          Total Commande:{' '}
                          <span className='text-info'>
                            {formatPrice(sumTotalAmount)} F{' '}
                          </span>
                        </h6>
                        <h6 className=''>
                          Total Payés:{' '}
                          <span className='text-success'>
                            {formatPrice(sumTotalPaye)} F{' '}
                          </span>
                        </h6>
                        <h6 className=''>
                          Total Non Payés:{' '}
                          <span className='text-danger'>
                            {formatPrice(sumTotalAmount - sumTotalPaye)} F{' '}
                          </span>
                        </h6>
                      </Col>
                      <Col className='d-flex gap-2 justify-content-start align-self-center my-3 '>
                        <h6>Filtrer par: </h6>
                        <div className='mx-4 d-flex gap-2 text-warning'>
                          <input
                            type='checkbox'
                            className='form-check-input'
                            id='filterReliqua'
                            onChange={() => setFilterReliqua(!filterReliqua)}
                          />
                          <label
                            className='form-check-label'
                            htmlFor='filterReliqua'
                          >
                            les Impayés
                          </label>
                        </div>
                        <div className='mx-4 d-flex gap-2 text-warning'>
                          <input
                            type='checkbox'
                            className='form-check-input'
                            id='filterToday'
                            onChange={() => setTodayPaiement(!todayPaiement)}
                          />
                          <label
                            className='form-check-label'
                            htmlFor='filterToday'
                          >
                            Aujourd'hui
                          </label>
                        </div>
                      </Col>
                      <Col className='d-flex gap-2 justify-content-center align-items-center my-3 '>
                        <h6>Boutique </h6>
                        <select
                          value={selectedBoutique ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setSelectedBoutique(v === '' ? null : Number(v));
                          }}
                          className='form-select border border-dark rounded '
                          style={{ cursor: 'pointer' }}
                        >
                          <option value=''>Toutes</option>
                          <option value={connectedUserBoutique ?? 0}>
                            {connectedUserBoutique ?? 0} - Ma Boutique
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
                    </Row>
                    {error && (
                      <div className='text-danger text-center'>
                        Erreur de chargement des données
                      </div>
                    )}
                    {isLoading && <LoadingSpiner />}

                    <div className='table-responsive table-card mt-3 mb-1'>
                      {filterSearchPaiement?.length === 0 && (
                        <div className='text-center text-mutate'>
                          Aucun paiement trouver !
                        </div>
                      )}
                      {!error &&
                        !isLoading &&
                        filterSearchPaiement?.length > 0 && (
                          <table
                            className='table align-middle table-nowrap table-hover'
                            id='paiementTable'
                          >
                            <thead className='table-light'>
                              <tr>
                                <th
                                  style={{ width: '50px' }}
                                  data-sort='paiementDate'
                                >
                                  Date de Paiement
                                </th>
                                <th data-sort='client'>Client</th>

                                <th data-sort='phoneNumber'>Téléphone</th>
                                <th data-sort='adresse'>
                                  Adresse de Livraison
                                </th>

                                <th data-sort='totaAmount'>
                                  Somme sur Facture
                                </th>
                                <th className='sort' data-sort='totaPayer'>
                                  Somme Payé
                                </th>
                                <th className='sort' data-sort='reliqua'>
                                  Reliquat
                                </th>
                                <th data-sort='motif'>Réduction</th>

                                <th data-sort='methode'>Methode de Paiement</th>
                                <th data-sort='action'>Action</th>
                              </tr>
                            </thead>

                            <tbody className='list form-check-all text-center'>
                              {filterSearchPaiement?.length > 0 &&
                                filterSearchPaiement?.map((paiement) => (
                                  <tr key={paiement?._id}>
                                    <th scope='row'>
                                      {new Date(
                                        paiement?.paiementDate
                                      ).toLocaleDateString()}
                                    </th>
                                    <td
                                      className='id'
                                      style={{ display: 'none' }}
                                    ></td>
                                    <td>
                                      {capitalizeWords(
                                        paiement?.commande?.fullName
                                      )}
                                    </td>
                                    <td>
                                      {formatPhoneNumber(
                                        paiement?.commande?.phoneNumber
                                      ) || '----'}
                                    </td>
                                    <td>
                                      {capitalizeWords(
                                        paiement?.commande?.adresse
                                      )}
                                    </td>

                                    <td>
                                      {formatPrice(paiement?.totalAmount)}
                                      {' F '}
                                    </td>
                                    <td>
                                      {formatPrice(paiement?.totalPaye)}
                                      {' F '}
                                    </td>
                                    <td>
                                      {paiement?.totalAmount -
                                        paiement?.totalPaye >
                                      0 ? (
                                        <span className='text-danger'>
                                          {' '}
                                          {formatPrice(
                                            paiement?.totalAmount -
                                              paiement?.totalPaye
                                          )}
                                          {' F '}
                                        </span>
                                      ) : (
                                        <span>
                                          {' '}
                                          {formatPrice(
                                            paiement?.totalAmount -
                                              paiement?.totalPaye
                                          )}
                                          {' F '}
                                        </span>
                                      )}
                                    </td>
                                    <td className='text-warning'>
                                      {formatPrice(paiement?.reduction)} F
                                    </td>
                                    <td className='text-warning'>
                                      {capitalizeWords(paiement?.methode)}
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
