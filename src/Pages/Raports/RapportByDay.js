import React, { useState, useMemo } from 'react';
import { Card, CardBody, Col, Input, Row } from 'reactstrap';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllDepenses } from '../../Api/queriesDepense';
import {
  asMoneyNumber,
  formatPrice,
  sumNetDueFromFactures,
  sumReductionFromRows,
  sumReliquatFromFactures,
} from '../components/capitalizeFunction';
import { useAllCommandes } from '../../Api/queriesCommande';

const RapportByDay = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  /**
   * OPTIMISATION PRO (Rapport journalier)
   *
   * Avant:
   * - Chargement de toutes les commandes/paiements/dépenses
   *
   * Maintenant:
   * - On ne récupère que la journée sélectionnée via `from/to` + `export=1`
   * - Pour paiements, on active `deep=1` (besoin de items.produit.achatPrice)
   */
  /**
   * IMPORTANT (performance / RAM):
   * - Pour le journalier, on a uniquement besoin des agrégats (totaux) + du compteur commandes.
   * - On évite de charger toutes les lignes, surtout `deep=1`.
   *
   * On conserve les mêmes hooks/variables, mais on change le mode:
   * - Commandes: `stats=range` => renvoie `{ countCommandes }`
   * - Paiements: `stats=bilans` => renvoie `{ sumTotalAmount, sumTotalPaye, sumReliquat, totalAchat, countPaiements }`
   * - Dépenses: `paged=1` avec `from/to` et `limit=1` => `totals.sumTotalExpense` fiable sur la période
   */
  const { data: commandes } = useAllCommandes({
    stats: 'range',
    from: selectedDate,
    to: selectedDate,
  });
  /**
   * IMPORTANT (règle métier demandée):
   * - Total à payé = Σ factures.totalAmount (net, après réduction)
   * - Total payé   = Σ factures.totalPaye
   * - Impayé       = Σ (net dû − payé)
   *
   * Donc on récupère aussi `commandesListe` + `factures.totalPaye` via `facturesTotals=1`.
   */
  const { data: commandesData } = useAllCommandes({
    paged: 1,
    export: 1,
    from: selectedDate,
    to: selectedDate,
    facturesTotals: 1,
  });
  const { data: paiementsData } = useAllPaiements({
    stats: 'bilans',
    from: selectedDate,
    to: selectedDate,
    /** Aligné sur le compteur commandes (date de commande). */
    basis: 'commande',
  });
  const { data: depenseData } = useAllDepenses({
    paged: 1,
    page: 1,
    limit: 1,
    from: selectedDate,
    to: selectedDate,
  });

  // Calcul de Nombre total de COMMANDE pour le mois sélectionné
  const totalCommandesNumber = useMemo(() => {
    return Number(commandes?.countCommandes || 0);
  }, [commandes, selectedDate]);

  // Calcul le total de somme Payés pour le mois sélectionné
  const totalPaiements = useMemo(() => {
    const factures = commandesData?.factures || [];
    if (factures.length > 0) return sumNetDueFromFactures(factures);
    const st = paiementsData?.sumTotalAmount;
    if (st != null && Number.isFinite(Number(st))) return asMoneyNumber(st);
    return 0;
  }, [commandesData, paiementsData, selectedDate]);
  // Total payé = Σ factures.totalPaye (règle métier).
  const totalPaiementsAmountPayed = useMemo(() => {
    return (commandesData?.factures || []).reduce(
      (acc, f) => acc + asMoneyNumber(f?.totalPaye),
      0
    );
  }, [commandesData, selectedDate]);

  // Impayé = reste dû net (après réduction), pas (montant commande − payé).
  const totalAmountNotPayed = useMemo(() => {
    const factures = commandesData?.factures || [];
    if (factures.length > 0) return sumReliquatFromFactures(factures);
    const sr = paiementsData?.sumReliquat;
    if (sr != null && Number.isFinite(Number(sr))) return asMoneyNumber(sr);
    return 0;
  }, [commandesData, paiementsData]);

  /**
   * --- Rapport journalier : totaux « commande / paiement » ---
   * Total à payer : Σ montants dus nets (`factures.totalAmount`).
   * Total payé    : Σ encaissements (`factures.totalPaye`).
   * Impayé        : Σ (montant dû net sur facture − payé) ; la réduction n’entre pas dans l’impayé.
   */
  // Total à payer = somme des montants commande dus pour le jour sélectionné.
  const rapportJourTotalCommandesAPayer = totalPaiements;
  // Total payé = somme des encaissements (`totalPaye`) pour le même jour.
  const rapportJourTotalPayeEncaisse = totalPaiementsAmountPayed;
  // Impayé : `sumReliquat` serveur si présent et numérique, sinon différence à payer − payé (même résultat attendu).
  const rapportJourMontantCommandesNonPayes = asMoneyNumber(totalAmountNotPayed);

  const totalReduction = useMemo(() => {
    const factures = commandesData?.factures || [];
    if (factures.length > 0) return sumReductionFromRows(factures);
    const sr = paiementsData?.sumReduction;
    if (sr != null && Number.isFinite(Number(sr))) return asMoneyNumber(sr);
    return 0;
  }, [commandesData, paiementsData]);

  // Calcul le total pour Dépenses pour le mois sélectionné
  const totalDepenses = useMemo(() => {
    return asMoneyNumber(depenseData?.totals?.sumTotalExpense);
  }, [depenseData, selectedDate]);

  // Calculer Le revenu (Bénéfice) pour le mois sélectionné

  // Calcule de CA , REVENUE, BENEFICE
  // const { totalCA, totalAchat, benefice } = useMemo(() => {
  const { totalAchat, benefice } = useMemo(() => {
    const achat = asMoneyNumber(paiementsData?.totalAchat);
    const total = totalPaiementsAmountPayed - achat;
    const benefice = total - totalDepenses;
    return { totalAchat: achat, benefice };
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
                minHeight: '120px',
                padding: '0 10px',
              }}
            >
              <h6 className='my-1 text-light'>
                Total À Payé:{' '}
                <span className='text-light'>
                  {' '}
                  {formatPrice(rapportJourTotalCommandesAPayer)} F
                </span>
              </h6>
              <h6 className='my-1 text-light'>
                Total payé:{' '}
                <span className='text-success'>
                  {' '}
                  {formatPrice(rapportJourTotalPayeEncaisse)} F
                </span>
              </h6>
              <h6 className='my-1 text-light'>
                Total de Réduction:{' '}
                <span className='text-warning'>
                  {' '}
                  {formatPrice(totalReduction)} F
                </span>
              </h6>
              <h6 className='my-1 text-light'>
                Impayé:{' '}
                <span className='text-danger'>
                  {' '}
                  {formatPrice(rapportJourMontantCommandesNonPayes)} F
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
