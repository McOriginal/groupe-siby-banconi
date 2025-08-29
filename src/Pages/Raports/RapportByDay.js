import React, { useState, useMemo } from 'react';
import { Card, CardBody, Col, Input, Row } from 'reactstrap';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllDepenses } from '../../Api/queriesDepense';
import { formatPrice } from '../components/capitalizeFunction';
import { useAllCommandes } from '../../Api/queriesCommande';

const RapportByDay = () => {
  const { data: commandes = [] } = useAllCommandes();
  const { data: paiementsData = [] } = useAllPaiements();
  const { data: depenseData = [] } = useAllDepenses();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Calcul de Nombre total de COMMANDE pour le mois sélectionné
  const totalCommandesNumber = useMemo(() => {
    return commandes?.commandesListe?.filter((item) => {
      const date = new Date(item.createdAt).toISOString().slice(0, 10);
      return date === selectedDate;
    }).length;
  }, [commandes, selectedDate]);

  // Calcul le total de COMMANDE pour le mois sélectionné
  // const totalCommandeAmount = useMemo(() => {
  //   return commandes?.commandesListe?.reduce((acc, item) => {
  //     const date = new Date(item.createdAt).toISOString().slice(0, 10);
  //     if (date === selectedDate) {
  //       acc += Number(item.totalAmount || 0);
  //     }
  //     return acc;
  //   }, 0);
  // }, [commandes, selectedDate]);

  // Calcul le total de somme Paiyés pour le mois sélectionné
  const totalPaiements = useMemo(() => {
    return paiementsData?.reduce((acc, item) => {
      const date = new Date(item?.paiementDate).toISOString().slice(0, 10);
      if (date === selectedDate) {
        acc += Number(item?.totalAmount || 0);
      }
      return acc;
    }, 0);
  }, [paiementsData, selectedDate]);
  // Calcul le total de somme Paiyés pour le mois sélectionné
  const totalPaiementsAmountPayed = useMemo(() => {
    return paiementsData?.reduce((acc, item) => {
      const date = new Date(item?.paiementDate).toISOString().slice(0, 10);
      if (date === selectedDate) {
        acc += Number(item?.totalPaye || 0);
      }
      return acc;
    }, 0);
  }, [paiementsData, selectedDate]);

  // Calcul le total de somme Impayés pour le mois sélectionné
  const totalAmountNotPayed = totalPaiements - totalPaiementsAmountPayed || 0;

  // useMemo(() => {
  //   return paiementsData?.reduce((acc, item) => {
  //     const date = new Date(item?.paiementDate).toISOString().slice(0, 10);
  //     if (date === selectedDate) {
  //       acc += Number(item?.totalAmount - item?.totalPaye || 0);
  //     }
  //     return acc;
  //   }, 0);
  // }, [paiementsData, selectedDate]);

  // Calcul le total pour Dépenses pour le mois sélectionné
  const totalDepenses = useMemo(() => {
    return depenseData.reduce((acc, item) => {
      const date = new Date(item.createdAt).toISOString().slice(0, 10);
      if (date === selectedDate) {
        acc += Number(item.totalAmount || 0);
      }
      return acc;
    }, 0);
  }, [depenseData, selectedDate]);

  // Calculer Le revenu (Bénéfice) pour le mois sélectionné
  const profit = useMemo(() => {
    return totalPaiements - totalDepenses;
  }, [totalPaiements, totalDepenses]);

  return (
    <React.Fragment>
      <Card style={{ boxShadow: '0px 0px 10px rgba(123, 123, 123, 0.28)' }}>
        {/* Filtrage Bouton */}
        <Row>
          <Col md={4}>
            <Card
              style={{
                background: 'linear-gradient(1deg, #183B4E 0%, #27548A 100%)',
              }}
            >
              <CardBody>
                <h6 className='text-white text-center'>
                  Sélectionnez une Date
                </h6>
                <div className='d-flex align-items-center justify-content-between mb-3'>
                  <Input
                    className='form-control serach'
                    type='date'
                    max={new Date().toISOString().split('T')[0]} // Limiter à la date actuelle
                    value={selectedDate} // Valeur par défaut à la date actuelle
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className='text-center text-white'></div>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <h4 className='text-center mt-5' style={{ color: ' #183B4E' }}>
              Rapports Journalier
            </h4>
          </Col>
        </Row>

        {/* Résultats */}
        <Row>
          {/* Bénefices */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #3E0703, #cbcaa5)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              {' '}
              <h5 className='mb-1 text-white'>Bénéfice (Revenue)</h5>
              {profit <= 0 ? (
                <h4 className='text-danger'>{formatPrice(profit)} F</h4>
              ) : (
                <h4 className='text-success'>{formatPrice(profit)} F</h4>
              )}
            </Card>{' '}
          </Col>
          {/* Paiements */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #3E0703, #cbcaa5)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h5 className='my-1' style={{ color: ' #00f504' }}>
                {formatPrice(totalPaiementsAmountPayed)} F
              </h5>

              <p className='text-white'>
                Entrées (Paiements)
                <i
                  className='fas fa-level-down-alt ms-2 fs-4'
                  style={{ color: '#00f504' }}
                ></i>
              </p>
            </Card>{' '}
          </Col>

          {/* Dépences */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #3E0703, #cbcaa5)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              {' '}
              <h4 className='mb-1' style={{ color: '#901E3E' }}>
                {formatPrice(totalDepenses)} F
              </h4>
              <p className='text-white'>
                Sortie (Dépenses)
                <i
                  className='fas fa-level-up-alt ms-2 fs-4'
                  style={{ color: ' #901E3E' }}
                ></i>
              </p>
            </Card>{' '}
          </Col>

          {/* COMMANDE */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #3E0703, #cbcaa5)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h5 className='my-1' style={{ color: ' #f3f045' }}>
                {totalCommandesNumber}
              </h5>
              <p className='text-white'>Commandes</p>
            </Card>{' '}
          </Col>

          <Col md={8}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #3E0703, #cbcaa5)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h5 className='my-1 text-light'>
                À Payé:{' '}
                <span className='text-light'>
                  {' '}
                  {formatPrice(totalPaiements)} F
                </span>
              </h5>
              <h5 className='my-1 text-light'>
                Net Payé:{' '}
                <span className='text-success'>
                  {' '}
                  {formatPrice(totalPaiementsAmountPayed)} F
                </span>
              </h5>
              <h5 className='my-1 text-light'>
                Impayé:{' '}
                <span className='text-danger'>
                  {' '}
                  {formatPrice(totalAmountNotPayed)} F
                </span>
              </h5>
            </Card>
          </Col>
        </Row>
      </Card>
    </React.Fragment>
  );
};

export default RapportByDay;
