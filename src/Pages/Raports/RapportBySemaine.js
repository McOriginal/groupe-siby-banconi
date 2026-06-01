import React, { useCallback, useMemo, useState } from 'react';
import { Card, Col, Row } from 'reactstrap';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllDepenses } from '../../Api/queriesDepense';
import {
  asMoneyNumber,
  formatPrice,
  sumNetDueFromFactures,
  sumReductionFromRows,
  sumReliquatFromFactures,
} from '../components/capitalizeFunction'; // Montants formatés + conversion API sûre
import { useAllCommandes } from '../../Api/queriesCommande';

const RapportBySemaine = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  /**
   * OPTIMISATION PRO (Rapport par période)
   *
   * On ne charge plus toutes les données.
   * Quand une période est sélectionnée, on récupère uniquement la plage via `from/to` + `export=1`.
   */
  const commandesParams =
    startDate && endDate
      ? { stats: 'range', from: startDate, to: endDate }
      : { paged: 1, page: 1, limit: 25 };
  const paiementsParams =
    startDate && endDate
      ? {
          stats: 'bilans',
          from: startDate,
          to: endDate,
          /** Même règle que Bilans : CA / payés sur commandes de la période (commandeDate). */
          basis: 'commande',
        }
      : { paged: 1, page: 1, limit: 25 };
  const depensesParams =
    startDate && endDate
      ? { paged: 1, page: 1, limit: 1, from: startDate, to: endDate }
      : { paged: 1, page: 1, limit: 25 };

  const { data: commandes } = useAllCommandes(commandesParams);
  /**
   * IMPORTANT (règle métier demandée):
   * - Total à payé = Σ factures.totalAmount (net)
   * - Total payé   = Σ factures.totalPaye
   * - Impayé       = Σ (net dû − payé)
   *
   * Donc on récupère aussi la liste (export) + `factures.totalPaye` via `facturesTotals=1`.
   * (Sans changer l'URL API commandes, seulement un paramètre optionnel.)
   */
  const { data: commandesData } = useAllCommandes(
    startDate && endDate
      ? {
          paged: 1,
          export: 1,
          from: startDate,
          to: endDate,
          facturesTotals: 1,
        }
      : { paged: 1, page: 1, limit: 25 }
  );
  const { data: paiementsData } = useAllPaiements(paiementsParams);
  const { data: depenseData } = useAllDepenses(depensesParams);

  // Helper pour filtrer entre deux dates
  const isBetweenDates = useCallback(
    (dateStr) => {
      if (!startDate || !endDate) return true; // si pas encore choisi, on ne filtre pas
      const date = new Date(dateStr).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end.getTime();
    },
    [startDate, endDate]
  );
  // Calcul de Nombre de Commande pour le 7 dernier jour
  const recentCommande = useMemo(
    () =>
      // Compat: si pas de filtre => on garde l'ancien calcul sur la liste paginée
      startDate && endDate
        ? new Array(Number(commandes?.countCommandes || 0)).fill(1)
        : commandes?.commandesListe?.filter((item) => {
            return isBetweenDates(item.commandeDate);
          }),
    // On ajoute startDate/endDate pour satisfaire eslint (sinon warning de deps manquantes).
    [commandes, isBetweenDates, startDate, endDate]
  );
  // Calcul de la somme total de Commande pour le 7 dernier jour
  const totalCommandeNumber = recentCommande?.length;

  // Recente Paiements Amount Paye
  const recentPaiement = useMemo(
    () =>
      // Compat: en mode stats=bilans, il n'y a pas de liste `paiements`
      startDate && endDate
        ? null
        : paiementsData?.paiements?.filter((item) => {
            return isBetweenDates(item.paiementDate);
          }),
    // On ajoute startDate/endDate pour satisfaire eslint (sinon warning de deps manquantes).
    [paiementsData, isBetweenDates, startDate, endDate]
  );

  // Total à payer = Σ montants dus nets (après réduction), jamais le brut commande.
  const totalPaiementsAmount =
    startDate && endDate
      ? (() => {
          const factures = commandesData?.factures || [];
          if (factures.length > 0) return sumNetDueFromFactures(factures);
          const st = paiementsData?.sumTotalAmount;
          if (st != null && Number.isFinite(Number(st))) return asMoneyNumber(st);
          return 0;
        })()
      : recentPaiement?.reduce(
          (acc, item) => acc + asMoneyNumber(item.totalAmount),
          0
        );
  // Total payé (règle métier) = Σ factures.totalPaye
  const totalPaiementsPaye =
    startDate && endDate
      ? (commandesData?.factures || []).reduce(
          (acc, f) => acc + asMoneyNumber(f?.totalPaye),
          0
        )
      : recentPaiement?.reduce((acc, item) => acc + asMoneyNumber(item.totalPaye), 0);
  // Impayé : net dû − payé (réduction exclue de l’impayé).
  const totalPaiementsToPaye =
    startDate && endDate
      ? sumReliquatFromFactures(commandesData?.factures || [])
      : (recentPaiement ?? []).reduce(
          (acc, item) =>
            acc +
            Math.max(
              0,
              asMoneyNumber(item?.totalAmount) - asMoneyNumber(item?.totalPaye)
            ),
          0
        );

  /**
   * --- Carte « Total à payer / Total payé / Impayé » (Rapport par période) ---
   * Total à payer : Σ montants dus nets.
   * Total payé    : Σ encaissements.
   * Impayé        : Σ (montant dû net sur paiement − payé), pas (commande − payé).
   */
  // Total à payer = montant total des commandes (somme des montants à payer, y compris part encore due).
  const rapportTotalCommandesAPayer = totalPaiementsAmount;
  // Total payé = somme des paiements encaissés sur la période (équivalent « commande ou paiement » payé).
  const rapportTotalPayeEncaisse = totalPaiementsPaye;
  // Impayé = reste dû : `sumReliquat` du backend si valeur numérique exploitable, sinon (à payer − payé).
  const rapportMontantCommandesNonPayes = asMoneyNumber(totalPaiementsToPaye);

  const totalReduction =
    startDate && endDate
      ? (() => {
          const factures = commandesData?.factures || [];
          if (factures.length > 0) return sumReductionFromRows(factures);
          const sr = paiementsData?.sumReduction;
          if (sr != null && Number.isFinite(Number(sr))) return asMoneyNumber(sr);
          return 0;
        })()
      : sumReductionFromRows(recentPaiement);

  // Recent Depense
  const recentDepense = useMemo(
    () =>
      (depenseData?.items || [])?.filter((item) => {
        return isBetweenDates(item.dateOfDepense);
      }),
    [depenseData, isBetweenDates]
  );

  // Calculer la somme Dépensés pour le 7 dernier jour
  const totalDepenses =
    startDate && endDate
      ? asMoneyNumber(depenseData?.totals?.sumTotalExpense)
      : recentDepense.reduce((acc, item) => acc + Number(item.totalAmount || 0), 0);

  // Calcule de CA , REVENUE, BENEFICE
  // const { totalCA, totalAchat, benefice } = useMemo(() => {
  const { totalAchat, benefice } = useMemo(() => {
    // Mode optimisé: stats=bilans renvoie directement totalAchat.
    if (startDate && endDate) {
      const achat = asMoneyNumber(paiementsData?.totalAchat);
      const total = totalPaiementsPaye - achat;
      const benefice = total - totalDepenses;
      return { totalAchat: achat, benefice };
    }

    // Fallback (ancien comportement) si pas de filtre sélectionné.
    const paiementsArray = Array.isArray(paiementsData?.paiements)
      ? paiementsData.paiements
      : [];
    const paiementsFiltres = paiementsArray.filter((item) => {
      return isBetweenDates(item?.paiementDate);
    });
    let totalAchat = 0;
    paiementsFiltres.forEach((paiement) => {
      const items = Array.isArray(paiement?.commande?.items)
        ? paiement.commande.items
        : [];
      items.forEach((item) => {
        const produit = item?.produit;
        if (!produit) return;
        totalAchat += (produit?.achatPrice || 0) * (item?.quantity || 0);
      });
    });
    const total = totalPaiementsPaye - totalAchat;
    const benefice = total - totalDepenses;
    return { totalAchat, benefice };
  }, [paiementsData, isBetweenDates, totalPaiementsPaye, totalDepenses, startDate, endDate]);

  return (
    <React.Fragment>
      <Card style={{ boxShadow: '0px 0px 10px rgba(123, 123, 123, 0.28)' }}>
        {/* Filtrage Bouton */}
        <Row className='mb-4'>
          <Col md={12}>
            <h4 className='text-center my-4' style={{ color: '#27548A' }}>
              Veuillez Sélectionnez
            </h4>
          </Col>
          <div className='mb-4 d-flex justify-content-around align-items-center'>
            <Col
              sm={4}
              style={{
                background: 'rgb(72, 60, 60)',
                padding: '15px ',
                borderRadius: '15px',
              }}
            >
              <p className='text-center text-light'>Date de Début</p>
              <input
                type='date'
                max={new Date().toISOString().split('T')[0]}
                className='form-control border-1 border-dark'
                value={startDate || ''}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col
              sm={4}
              style={{
                background: 'rgb(72, 60, 60)',
                padding: '15px ',
                borderRadius: '15px',
              }}
            >
              <p className='text-center text-light'>Date de Fin</p>
              <input
                type='date'
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
                className='form-control border-1 border-dark'
                value={endDate || ''}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
          </div>
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
                minHeight: '130px',
              }}
            >
              <h5 className='my-1 text-light'>
                Total À Payé:{' '}
                <span className='text-light ps-2'>
                  {' '}
                  {formatPrice(rapportTotalCommandesAPayer)} F
                </span>
              </h5>
              <h5 className='my-1 text-light'>
                Total payé:{' '}
                <span className='text-success ps-2'>
                  {' '}
                  {formatPrice(rapportTotalPayeEncaisse)} F
                </span>
              </h5>
              <h5 className='my-1 text-light'>
                Total de Réduction:{' '}
                <span className='text-warning ps-2'>
                  {' '}
                  {formatPrice(totalReduction)} F
                </span>
              </h5>
              <h5 className='my-1 text-light'>
                Impayé:{' '}
                <span className='text-danger ps-2'>
                  {' '}
                  {formatPrice(rapportMontantCommandesNonPayes)} F
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
