import React, { useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { connectedUserBoutique } from '../Authentication/userInfos';
import { useAllPaiements } from '../../Api/queriesPaiement';
export default function Bilans() {
  const { data: paiementsData, isLoading, error } = useAllPaiements();
  const tableRef = useRef(null);
  // State de Recherche
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fonction de Rechercher
  const filterSearchPaiement = paiementsData?.paiements?.filter((item) => {
    // Filtrer par date
    if (startDate && endDate) {
      const paiementDate = new Date(item.commande?.commandeDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Inclure toute la journée de fin
      if (paiementDate < start || paiementDate > end) {
        return false;
      }
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

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Rapport' breadcrumbItem='Bilans de Semaine' />

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='bilanssList'>
                    <Row className='g-4 mb-3 '>
                      <div className='d-flex justify-content-around align-items-center gap-2'>
                        <h3>Bilans de Boutique</h3>
                        <div className='d-flex gap-1'>
                          <DownloadTableExcel
                            filename={`bilans de ${startDate} à ${endDate}`}
                            sheet={`bilans de ${startDate} à ${endDate}`}
                            currentTableRef={tableRef.current}
                          >
                            <Button color='success'>
                              Télécharger en Excel
                            </Button>
                          </DownloadTableExcel>
                        </div>
                      </div>

                      <div className='d-flex justify-content-between flex-wrap align-items-center gap-3'>
                        <div
                          md='12'
                          className='d-flex flex-column justify-content-around mt-4 flex-wrap'
                        >
                          <h6 className=''>
                            Commande Entregistrées:{' '}
                            <span className='text-info'>
                              {formatPrice(filterSearchPaiement?.length)}
                            </span>
                          </h6>
                          <h6 className=''>
                            Montant Total:{' '}
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
                        </div>

                        <div className='d-flex flex-column gap-3'>
                          {startDate != null && endDate != null && (
                            <Button
                              color='danger'
                              onClick={() => {
                                setStartDate(null);
                                setEndDate(null);
                              }}
                            >
                              Effacer le Filtre
                            </Button>
                          )}

                          <div md='4'>
                            <h6>Date de début</h6>
                            <input
                              name='startDate'
                              onChange={(e) => setStartDate(e.target.value)}
                              value={startDate ?? ''}
                              placeholder='Entrez la date de début'
                              type='date'
                              className='form-control p-2 border-1 border-dark'
                              max={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div md='4'>
                            <h6>Date de Fin</h6>
                            <input
                              name='endDate'
                              onChange={(e) => setEndDate(e.target.value)}
                              value={endDate ?? ''}
                              placeholder='Entrez la date de Fin'
                              type='date'
                              className='form-control p-2 border-1 border-dark'
                              max={new Date().toISOString().split('T')[0]}
                              min={startDate ?? undefined}
                            />
                          </div>
                        </div>
                      </div>
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
                      <table
                        className='table align-middle table-nowrap table-hover'
                        id='paiementTable'
                        ref={tableRef}
                      >
                        <thead className='table-light'>
                          <tr className='text-center'>
                            <th
                              style={{ width: '50px' }}
                              data-sort='paiementDate'
                            >
                              Date de Commande
                            </th>
                            <th>Articles Commandés</th>
                            <th>Quantité</th>
                            <th>Prix </th>
                            <th data-sort='client'>Client</th>

                            <th data-sort='phoneNumber'>Téléphone</th>
                            <th data-sort='adresse'>Adresse de Livraison</th>

                            <th data-sort='totaAmount'>Montant de Commande</th>
                            <th data-sort='motif'>Réduction</th>
                            <th className='sort' data-sort='totaPayer'>
                              Total Payé
                            </th>
                            <th className='sort' data-sort='reliqua'>
                              Reliquat
                            </th>

                            <th data-sort='methode'>Methode de Paiement</th>
                          </tr>
                        </thead>

                        <tbody className='list form-check-all text-center'>
                          {filterSearchPaiement?.length > 0 &&
                            filterSearchPaiement?.map((paiement) => (
                              <tr key={paiement?._id}>
                                <th scope='row'>
                                  {new Date(
                                    paiement?.commande?.commandeDate
                                  ).toLocaleDateString()}
                                </th>
                                <td
                                  className=' text-start'
                                  style={{ width: '400px' }}
                                >
                                  {paiement?.commande?.items?.map(
                                    (it, index) => (
                                      <p key={index} className='d-block'>
                                        {it?.produit?.name}
                                      </p>
                                    )
                                  )}
                                </td>
                                <td>
                                  {paiement?.commande?.items?.map(
                                    (it, index) => (
                                      <p key={index} className='d-block'>
                                        {formatPrice(it?.quantity)}
                                      </p>
                                    )
                                  )}
                                </td>
                                <td>
                                  {paiement?.commande?.items?.map(
                                    (it, index) => (
                                      <p key={index} className='d-block'>
                                        {formatPrice(
                                          it?.customerPrice * it?.quantity
                                        )}
                                        {' F '}
                                      </p>
                                    )
                                  )}
                                </td>

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
                                  {capitalizeWords(paiement?.commande?.adresse)}
                                </td>

                                <td>
                                  {formatPrice(paiement?.totalAmount)}
                                  {' F '}
                                </td>
                                <td className='text-warning'>
                                  {formatPrice(paiement?.reduction)} F
                                </td>
                                <td>
                                  {formatPrice(paiement?.totalPaye)}
                                  {' F '}
                                </td>
                                <td>
                                  {paiement?.totalAmount - paiement?.totalPaye >
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
                                  {capitalizeWords(paiement?.methode)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
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
