import React, { useMemo } from 'react';
import { Card, Col, Row } from 'reactstrap';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllDepenses } from '../../Api/queriesDepense';
import { formatPrice } from '../components/capitalizeFunction'; // Pour afficher les montants formatés
import { useAllCommandes } from '../../Api/queriesCommande';

const RapportBySemaine = () => {
  const { data: commandes = [] } = useAllCommandes();
  const { data: paiementsData = [] } = useAllPaiements();
  const { data: depenseData = [] } = useAllDepenses();

  // Calcule de la date pour le 7 dernier jours
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Calcul de Nombre de Commande pour le 7 dernier jour
  const recentCommande = useMemo(
    () =>
      commandes?.commandesListe?.filter((item) => {
        const t = new Date(item.commandeDate).getTime();
        return t >= sevenDaysAgo;
      }),
    [commandes, sevenDaysAgo]
  );
  // Calcul de la somme total de Commande pour le 7 dernier jour
  const totalCommandeNumber = recentCommande?.length;

  // Recente Paiements Amount Paye
  const recentPaiement = useMemo(
    () =>
      paiementsData?.paiements?.filter((item) => {
        const paie = new Date(item.paiementDate).getTime();
        return paie >= sevenDaysAgo;
      }),
    [paiementsData, sevenDaysAgo]
  );

  // Calculer le total de Somme à Payé pour le 7 dernier jour
  const totalPaiementsAmount = recentPaiement?.reduce(
    (acc, item) => acc + Number(item.totalAmount || 0),
    0
  );
  // Calculer le total de Somme Payé pour le 7 dernier jour
  const totalPaiementsPaye = recentPaiement?.reduce(
    (acc, item) => acc + Number(item.totalPaye || 0),
    0
  );
  // Calculer le total de Somme Impayé pour le 7 dernier jour
  const totalPaiementsToPaye = totalPaiementsAmount - totalPaiementsPaye || 0;

  // Recent Depense
  const recentDepense = useMemo(
    () =>
      depenseData?.filter((item) => {
        const depen = new Date(item.dateOfDepense).getTime();
        return depen >= sevenDaysAgo;
      }),
    [depenseData, sevenDaysAgo]
  );

  // Calculer la somme Dépensés pour le 7 dernier jour
  const totalDepenses = recentDepense.reduce(
    (acc, item) => acc + Number(item.totalAmount || 0),
    0
  );

  // Calcule de CA , REVENUE, BENEFICE
  // const { totalCA, totalAchat, benefice } = useMemo(() => {
  const { totalAchat, benefice } = useMemo(() => {
    if (!paiementsData?.paiements) {
      return { totalAchat: 0, benefice: 0 };
    }

    // On filtre d'abord les paiements par date sélectionnée
    const paiementsFiltres = paiementsData.paiements.filter((item) => {
      const date = new Date(item?.paiementDate).getTime();
      return date >= sevenDaysAgo;
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

    const total = totalPaiementsPaye - totalAchat;
    const benefice = total - totalDepenses;

    return { totalAchat, benefice };
  }, [paiementsData, sevenDaysAgo, totalPaiementsPaye, totalDepenses]);

  return (
    <React.Fragment>
      <Card style={{ boxShadow: '0px 0px 10px rgba(123, 123, 123, 0.28)' }}>
        {/* Filtrage Bouton */}
        <Row>
          <Col md={12}>
            <h4 className='text-center my-4' style={{ color: '#27548A' }}>
              Rapports de 7 Dernier Jours
            </h4>
          </Col>
        </Row>

        {/* Résultats */}
        <Row>
          {/* Bénefices */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #090979, #222831)',
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
                background: 'linear-gradient(to top right , #090979, #222831)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h4 className='mb-1' style={{ color: '#B6F500' }}>
                {formatPrice(totalPaiementsPaye)} F
              </h4>
              <p className='text-white'>
                Revenue (Chiffre d'Affaire)
                <i
                  className='fas fa-level-down-alt ms-2 fs-4'
                  style={{ color: '#B6F500' }}
                ></i>
              </p>
            </Card>{' '}
          </Col>
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #090979, #222831)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h4 className='mb-1' style={{ color: '#B6F500' }}>
                {formatPrice(totalAchat)} F
              </h4>
              <p className='text-white'>
                Achat sur Revenue
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
                background: 'linear-gradient(to top right , #090979, #222831)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              {' '}
              <h4 className='mb-1' style={{ color: '#CB0404' }}>
                {formatPrice(totalDepenses)} F
              </h4>
              <p className='text-white'>
                Dépenses
                <i
                  className='fas fa-level-up-alt ms-2 fs-4'
                  style={{ color: '#CB0404' }}
                ></i>
              </p>
            </Card>{' '}
          </Col>

          {/* Commande */}
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #090979, #222831)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h5 className='text-warning mb-1'>{totalCommandeNumber}</h5>
              <p className='text-white'>Commandes</p>
            </Card>{' '}
          </Col>
          <Col sm={6} lg={4}>
            <Card
              style={{
                background: 'linear-gradient(to top right , #090979, #222831)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
              }}
            >
              <h5 className='my-1 text-light'>
                Total À Payé:{' '}
                <span className='text-light ps-2'>
                  {' '}
                  {formatPrice(totalPaiementsAmount)} F
                </span>
              </h5>
              <h5 className='my-1 text-light'>
                Net Payé:{' '}
                <span className='text-success ps-2'>
                  {' '}
                  {formatPrice(totalPaiementsPaye)} F
                </span>
              </h5>
              <h5 className='my-1 text-light'>
                Impayé:{' '}
                <span className='text-danger ps-2'>
                  {' '}
                  {formatPrice(totalPaiementsToPaye)} F
                </span>
              </h5>
            </Card>{' '}
          </Col>
        </Row>
      </Card>
    </React.Fragment>
  );
};

export default RapportBySemaine;
