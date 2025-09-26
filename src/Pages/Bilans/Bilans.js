import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllDepenses } from '../../Api/queriesDepense';
export default function Bilans() {
  const { data: paiementsData, isLoading, error } = useAllPaiements();
  const { data: depenseData } = useAllDepenses();
  const tableRef = useRef(null);
  // State de Recherche
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const isBetweenDates = useCallback(
    (dateStr) => {
      if (!startDate || !endDate) return true; // si pas encore choisi, on ne filtre pas
      const date = new Date(dateStr).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // inclure toute la journée
      return date >= start && date <= end.getTime();
    },
    [startDate, endDate]
  );
  // Fonction de Rechercher
  const filterPaiement = paiementsData?.paiements?.filter((item) => {
    // Filtrer par date
    return isBetweenDates(item.commande?.commandeDate);
  });

  // Fonction de Rechercher
  const filterDepense = depenseData?.filter((item) => {
    // Filtrer par date
    return isBetweenDates(item?.dateOfDepense);
  });

  // Total de commandes
  const sumTotalAmount = filterPaiement?.reduce((curr, item) => {
    return (curr += item?.totalAmount);
  }, 0);

  // Total Payés
  const sumTotalPaye = filterPaiement?.reduce((curr, item) => {
    return (curr += item?.totalPaye);
  }, 0);

  // Total Depensés
  const sumTotalDepense = filterDepense?.reduce((curr, item) => {
    return (curr += item?.totalAmount);
  }, 0);

  const { totalAchat, benefice } = useMemo(() => {
    if (!paiementsData?.paiements) {
      return { totalAchat: 0, benefice: 0 };
    }

    // On filtre d'abord les paiements par date sélectionnée
    const paiementsFiltres = paiementsData?.paiements?.filter((item) => {
      return isBetweenDates(item?.paiementDate);
    });

    // let totalCA = 0; // chiffre d’affaires
    let totalAchat = 0; // coût d’achat

    paiementsFiltres.forEach((paiement) => {
      paiement.commande?.items.forEach((item) => {
        const produit = item?.produit;
        if (!produit) return;

        // totalCA += (item?.customerPrice || 0) * (item?.quantity || 0);
        totalAchat += (produit?.achatPrice || 0) * (item?.quantity || 0);
      });
    });

    const total = sumTotalPaye - totalAchat;
    const benefice = total - sumTotalDepense;

    return { totalAchat, benefice };
  }, [paiementsData, isBetweenDates, sumTotalPaye, sumTotalDepense]);

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
                              {formatPrice(filterPaiement?.length)}
                            </span>
                          </h6>
                          <h6 className=''>
                            Chiffre d'Affaire:{' '}
                            <span className='text-info'>
                              {formatPrice(sumTotalAmount)} F{' '}
                            </span>
                          </h6>
                          <h6 className=''>
                            Revenu :{' '}
                            <span className='text-success'>
                              {formatPrice(sumTotalPaye)} F{' '}
                            </span>
                          </h6>
                          <h6 className=''>
                            Total Achats :{' '}
                            <span className='text-success'>
                              {formatPrice(totalAchat)} F{' '}
                            </span>
                          </h6>
                          <h6 className=''>
                            Réliquat:{' '}
                            <span className='text-danger'>
                              {formatPrice(sumTotalAmount - sumTotalPaye)} F{' '}
                            </span>
                          </h6>
                          <h6 className=''>
                            Depenses:{' '}
                            <span className='text-danger'>
                              {formatPrice(sumTotalDepense)} F{' '}
                            </span>
                          </h6>
                          <h6 className=''>
                            Benefice:{' '}
                            <span
                              className={`${
                                benefice > 0 ? 'text-primary' : 'text-danger'
                              }`}
                            >
                              {formatPrice(benefice)} F{' '}
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
                      {filterPaiement?.length === 0 && (
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
                          {filterPaiement?.length > 0 &&
                            filterPaiement?.map((paiement) => (
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
