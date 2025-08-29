import React, { useState, useMemo } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllDepenses } from '../../Api/queriesDepense';
import { formatPrice } from '../components/capitalizeFunction'; // Pour afficher les montants formatés
import { useAllCommandes } from '../../Api/queriesCommande';

const SelectedMounthTotalResult = () => {
  const { data: commandes = [] } = useAllCommandes();
  const { data: paiementsData = [] } = useAllPaiements();
  const { data: depenseData = [] } = useAllDepenses();

  const monthOptions = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Calcul de Nombre total de COMMANDE pour le mois sélectionné
  const totalCommandesNumber = useMemo(() => {
    return commandes?.commandesListe?.filter((item) => {
      const date = new Date(item.createdAt);
      return !isNaN(date) && date.getMonth() === selectedMonth;
    }).length;
  }, [commandes, selectedMonth]);

  // Calcul de somme total de Commandes pour le mois sélectionné
  // const totalTraitementAmount = useMemo(() => {
  //   return commandes?.commandesListe?.reduce((acc, item) => {
  //     const date = new Date(item.createdAt);
  //     if (!isNaN(date) && date.getMonth() === selectedMonth) {
  //       acc += Number(item.totalAmount || 0);
  //     }
  //     return acc;
  //   }, 0);
  // }, [commandes, selectedMonth]);

  // Calcul de somme total de Paiements pour le mois sélectionné
  const totalPaiementsToPaye = useMemo(() => {
    return paiementsData?.reduce((acc, item) => {
      const date = new Date(item.paiementDate);
      if (!isNaN(date) && date.getMonth() === selectedMonth) {
        acc += Number(item.totalAmount || 0);
      }
      return acc;
    }, 0);
  }, [paiementsData, selectedMonth]);

  // Calcul de somme total Payé pour le mois sélectionné
  const totalPaiementsAmountPaye = useMemo(() => {
    return paiementsData?.reduce((acc, item) => {
      const date = new Date(item.paiementDate);
      if (!isNaN(date) && date.getMonth() === selectedMonth) {
        acc += Number(item.totalPaye || 0);
      }
      return acc;
    }, 0);
  }, [paiementsData, selectedMonth]);

  // Calcul de somme total de Paiement Impayé pour le mois sélectionné
  const totalPaiementsNotPaye =
    totalPaiementsToPaye - totalPaiementsAmountPaye || 0;

  // Calcul de total pour Dépenses pour le mois sélectionné
  const totalDepenses = useMemo(() => {
    return depenseData.reduce((acc, item) => {
      const date = new Date(item.createdAt);
      if (!isNaN(date) && date.getMonth() === selectedMonth) {
        acc += Number(item.totalAmount || 0);
      }
      return acc;
    }, 0);
  }, [depenseData, selectedMonth]);

  // Calculer Le revenu (Bénéfice) pour le mois sélectionné
  const profit = useMemo(() => {
    return totalPaiementsToPaye - totalDepenses;
  }, [totalPaiementsToPaye, totalDepenses]);

  return (
    <React.Fragment>
      <Card style={{ boxShadow: '0px 0px 10px rgba(123, 123, 123, 0.28)' }}>
        {/* Filtrage Bouton */}
        <Row>
          <Col md={4}>
            <Card
              style={{
                background: 'linear-gradient(1deg, #ff0099, #493240)',
              }}
            >
              <CardBody>
                <h6 className='text-white text-center'>Sélectionnez un Mois</h6>
                <div className='d-flex align-items-center justify-content-between mb-3'>
                  <select
                    className='form-select form-select-sm'
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {monthOptions.map((label, index) => (
                      <option key={index} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='text-center text-white'></div>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <h4 className='text-center mt-5' style={{ color: '#BE5B50' }}>
              Rapports Mensuel
            </h4>
          </Col>
        </Row>

        {/* Résultats */}
        <Row>
          {/* Bénefices */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #654ea3, #eaafc8)',
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
                background: 'linear-gradient(to top right ,#654ea3, #eaafc8)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h4 className='mb-1' style={{ color: '#B6F500' }}>
                {formatPrice(totalPaiementsAmountPaye)} F
              </h4>
              <p className='text-white'>
                Entrée (Paiements)
                <i
                  className='fas fa-level-down-alt ms-2 fs-4'
                  style={{ color: '#B6F500' }}
                ></i>
              </p>
            </Card>{' '}
          </Col>

          {/* Dépences */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #654ea3, #eaafc8)',
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
                  style={{ color: '#901E3E' }}
                ></i>
              </p>
            </Card>{' '}
          </Col>

          {/* Commandes */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right ,#654ea3, #eaafc8)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h5 className='text-warning my-1'>{totalCommandesNumber}</h5>
              <p className='text-white'>Commandes</p>
            </Card>{' '}
          </Col>
          <Col md={8}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #654ea3, #eaafc8)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h5 className='my-1'>
                À Payé:{' '}
                <span className='text-light ps-3'>
                  {' '}
                  {formatPrice(totalPaiementsToPaye)} F
                </span>
              </h5>
              <h5 className='my-1'>
                Payé:{' '}
                <span className='text-success ps-3'>
                  {' '}
                  {formatPrice(totalPaiementsAmountPaye)} F
                </span>
              </h5>
              <h5 className='my-1'>
                Impayé:{' '}
                <span className='text-danger ps-3'>
                  {' '}
                  {formatPrice(totalPaiementsNotPaye)} F
                </span>
              </h5>
            </Card>
          </Col>
        </Row>
      </Card>
    </React.Fragment>
  );
};

export default SelectedMounthTotalResult;
