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
      const date = new Date(item.commandeDate).toISOString().slice(0, 10);
      return date === selectedDate;
    }).length;
  }, [commandes, selectedDate]);

  // Calcul le total de somme Payés pour le mois sélectionné
  const totalPaiements = useMemo(() => {
    return paiementsData?.paiements?.reduce((acc, item) => {
      const date = new Date(item?.paiementDate).toISOString().slice(0, 10);
      if (date === selectedDate) {
        acc += Number(item?.totalAmount || 0);
      }
      return acc;
    }, 0);
  }, [paiementsData, selectedDate]);
  // Calcul le total de somme Paiyés pour le mois sélectionné
  const totalPaiementsAmountPayed = useMemo(() => {
    return paiementsData?.paiements?.reduce((acc, item) => {
      const date = new Date(item?.paiementDate).toISOString().slice(0, 10);
      if (date === selectedDate) {
        acc += Number(item?.totalPaye || 0);
      }
      return acc;
    }, 0);
  }, [paiementsData, selectedDate]);

  // Calcul le total de somme Impayés pour le mois sélectionné
  const totalAmountNotPayed = totalPaiements - totalPaiementsAmountPayed || 0;

  // Calcul le total pour Dépenses pour le mois sélectionné
  const totalDepenses = useMemo(() => {
    return depenseData?.reduce((acc, item) => {
      const date = new Date(item.dateOfDepense).toISOString().slice(0, 10);
      if (date === selectedDate) {
        acc += Number(item.totalAmount || 0);
      }
      return acc;
    }, 0);
  }, [depenseData, selectedDate]);

  // Calculer Le revenu (Bénéfice) pour le mois sélectionné

  // Calcule de CA , REVENUE, BENEFICE
  // const { totalCA, totalAchat, benefice } = useMemo(() => {
  const { totalAchat, benefice } = useMemo(() => {
    if (!paiementsData?.paiements) {
      return { totalAchat: 0, benefice: 0 };
    }

    // On filtre d'abord les paiements par date sélectionnée
    const paiementsFiltres = paiementsData.paiements.filter((item) => {
      const date = new Date(item?.paiementDate).toISOString().slice(0, 10);
      return date === selectedDate;
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

    const total = totalPaiementsAmountPayed - totalAchat;
    const benefice = total - totalDepenses;

    return { totalAchat, benefice };
  }, [paiementsData, selectedDate, totalPaiementsAmountPayed, totalDepenses]);

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
                    style={{ cursor: 'pointer' }}
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
                background: ' #250902',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              {' '}
              <h5 className='mb-1 text-white'>Bénéfice </h5>
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
                background: ' #38040e',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <p className='text-white'>
                Revenue (Chiffre d'Affaires)
                <i
                  className='fas fa-level-down-alt ms-2 fs-4'
                  style={{ color: '#00f504' }}
                ></i>
              </p>
              <h5 className='my-1' style={{ color: ' #00f504' }}>
                {formatPrice(totalPaiementsAmountPayed)} F
              </h5>
            </Card>{' '}
          </Col>
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: ' #640d14',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <p className='text-white'>Achat sur Revenue</p>
              <h5 className='my-1' style={{ color: ' #00f504' }}>
                {formatPrice(totalAchat)} F
              </h5>
            </Card>{' '}
          </Col>

          {/* Dépences */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: ' #f58549',
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
                Dépenses
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
                background: ' #ad2831',
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

          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #3E0703, #cbcaa5)',
                justifyContent: 'center',
                alignItems: 'start',
                height: '100px',
                padding: '0 10px',
              }}
            >
              <h6 className='my-1 text-light'>
                Total À Payé:{' '}
                <span className='text-light'>
                  {' '}
                  {formatPrice(totalPaiements)} F
                </span>
              </h6>
              <h6 className='my-1 text-light'>
                Net Payé:{' '}
                <span className='text-success'>
                  {' '}
                  {formatPrice(totalPaiementsAmountPayed)} F
                </span>
              </h6>
              <h6 className='my-1 text-light'>
                Impayé:{' '}
                <span className='text-danger'>
                  {' '}
                  {formatPrice(totalAmountNotPayed)} F
                </span>
              </h6>
            </Card>
          </Col>
        </Row>
      </Card>
    </React.Fragment>
  );
};

export default RapportByDay;
