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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

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

  // Calcul de Nombre total de COMMANDE pour le mois sélectionné
  const totalCommandesNumber = useMemo(() => {
    return commandes?.commandesListe?.filter((item) => {
      const date = new Date(item.commandeDate);
      return !isNaN(date) && date.getMonth() === selectedMonth;
    }).length;
  }, [commandes, selectedMonth]);

  // Calcul de somme total de Paiements pour le mois sélectionné
  const totalPaiementsToPaye = useMemo(() => {
    return paiementsData?.paiements?.reduce((acc, item) => {
      const date = new Date(item.paiementDate);
      if (!isNaN(date) && date.getMonth() === selectedMonth) {
        acc += Number(item.totalAmount || 0);
      }
      return acc;
    }, 0);
  }, [paiementsData, selectedMonth]);

  // Calcul de somme total Payé pour le mois sélectionné
  const totalPaiementsAmountPaye = useMemo(() => {
    return paiementsData?.paiements?.reduce((acc, item) => {
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
    return depenseData?.reduce((acc, item) => {
      const date = new Date(item.dateOfDepense);
      if (!isNaN(date) && date.getMonth() === selectedMonth) {
        acc += Number(item.totalAmount || 0);
      }
      return acc;
    }, 0);
  }, [depenseData, selectedMonth]);

  // Calculer Le revenu (Bénéfice) pour le mois sélectionné

  // Calcule de CA , REVENUE, BENEFICE
  // const { totalCA, totalAchat, benefice } = useMemo(() => {
  const { totalAchat, benefice } = useMemo(() => {
    if (!paiementsData?.paiements) {
      return { totalAchat: 0, benefice: 0 };
    }

    // On filtre d'abord les paiements par date sélectionnée
    const paiementsFiltres = paiementsData.paiements.filter((item) => {
      const date = new Date(item?.paiementDate);

      return date.getMonth() === selectedMonth;
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
    const total = totalPaiementsAmountPaye - totalAchat;
    const benefice = total - totalDepenses;

    return { totalAchat, benefice };
  }, [paiementsData, selectedMonth, totalPaiementsAmountPaye, totalDepenses]);

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
            <h4 className='text-center mt-5' style={{ color: ' #BE5B50' }}>
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
                background: ' #0d1b2a',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              {' '}
              <h5 className='mb-1 text-white'>Bénéfice</h5>
              {benefice <= 0 ? (
                <h4 className='text-danger'>{formatPrice(benefice)} F</h4>
              ) : (
                <h4 className='text-success'>{formatPrice(benefice)} F</h4>
              )}
            </Card>{' '}
          </Col>
          {/* Paiements */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: ' #1b263b',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <p className='text-white'>
                Revenue (Chiffre d'Affaire)
                <i
                  className='fas fa-level-down-alt ms-2 fs-4'
                  style={{ color: '#B6F500' }}
                ></i>
              </p>
              <h4 className='mb-1' style={{ color: ' #B6F500' }}>
                {formatPrice(totalPaiementsAmountPaye)} F
              </h4>
            </Card>{' '}
          </Col>
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: ' #415a77',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <p className='text-white'>Achat sur Revenue</p>
              <h4 className='mb-1' style={{ color: '#B6F500' }}>
                {formatPrice(totalAchat)} F
              </h4>
            </Card>{' '}
          </Col>

          {/* Dépences */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: ' #778da9',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              {' '}
              <p className='text-white'>
                Dépenses
                <i
                  className='fas fa-level-up-alt ms-2 fs-4'
                  style={{ color: '#901E3E' }}
                ></i>
              </p>
              <h4 className='mb-1' style={{ color: '#901E3E' }}>
                {formatPrice(totalDepenses)} F
              </h4>
            </Card>{' '}
          </Col>

          {/* Commandes */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: ' #0077b6',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <p className='text-white'>Commandes</p>
              <h5 className='text-warning my-1'>{totalCommandesNumber}</h5>
            </Card>{' '}
          </Col>
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: ' #03045e',
                justifyContent: 'center',
                alignItems: 'start',
                height: '100px',
                padding: '0px 10px',
              }}
            >
              <h5 className='my-1 text-light'>
                Total À Payé:{' '}
                <span className='text-light ps-3'>
                  {' '}
                  {formatPrice(totalPaiementsToPaye)} F
                </span>
              </h5>
              <h5 className='my-1 text-light'>
                Net Payé:{' '}
                <span className='text-success ps-3'>
                  {' '}
                  {formatPrice(totalPaiementsAmountPaye)} F
                </span>
              </h5>
              <h5 className='my-1 text-light'>
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
