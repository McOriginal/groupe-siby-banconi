import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  asMoneyNumber,
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
  sumNetDueFromFactures,
  sumReductionFromRows,
  sumReliquatFromFactures,
} from '../components/capitalizeFunction';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllDepenses } from '../../Api/queriesDepense';
import { useAllCommandes } from '../../Api/queriesCommande';
export default function Bilans() {
  /**
   * OPTIMISATION PRO (Bilans)
   *
   * Avant:
   * - `useAllPaiements()` et `useAllDepenses()` sans params => chargeait tout l'historique
   * - Filtrage par date côté navigateur => lourd RAM/CPU
   *
   * Maintenant:
   * - On utilise `export=1` + `from/to` pour ne récupérer QUE la période demandée
   * - `deep=1` pour paiements: nécessaire au calcul des achats (items.produit.achatPrice)
   *
   * IMPORTANT:
   * - On ne change pas l'URL API, uniquement des query params optionnels.
   */
  /**
   * Filtre par défaut (demande utilisateur):
   * - À l'ouverture de la page, on doit afficher les données sur les 7 derniers jours
   *   et ces dates doivent être visibles dans les champs "Début" et "Fin".
   *
   * Format:
   * - On garde le format ISO `YYYY-MM-DD` car il est directement compatible
   *   avec les `<input type="date" />` et les query params backend `from/to`.
   */
  const todayISO = new Date().toISOString().split('T')[0];
  const sevenDaysAgoISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 6); // aujourd'hui inclus => 7 jours (J-6 .. J)
    return d.toISOString().split('T')[0];
  })();
  const [startDate, setStartDate] = useState(sevenDaysAgoISO);
  const [endDate, setEndDate] = useState(todayISO);

  /**
   * OPTIMISATION (SANS CHANGER LE TABLEAU)
   *
   * Problème:
   * - Les totaux (CA / Payé / Dépenses / Achats / Bénéfice) calculés côté navigateur
   *   deviennent faux dès qu'on ne charge qu'une page (paged) ou quand le dataset est gros.
   * - `deep=1` (populate complet produits) peut devenir très lourd.
   *
   * Solution:
   * - On garde EXACTEMENT le même tableau (paiements + articles + quantité + prix).
   * - On récupère les totaux fiables via un mode serveur `stats=bilans`
   *   (payload minuscule, pas de boucle lourde côté navigateur).
   * - On conserve le fetch "détails" pour alimenter le tableau, mais on évite de recalculer
   *   les totaux à partir de ces détails.
   *
   * Contrainte:
   * - On ne change pas les noms de fonctions/variables (useAllPaiements/useAllDepenses, etc.)
   * - On ne change pas les URLs API, uniquement des query params optionnels.
   */

  const paiementsParams =
    startDate && endDate
      ? {
          paged: 1,
          export: 1,
          deep: 1,
          from: startDate,
          to: endDate,
          /**
           * `basis=commande` : filtre serveur sur **commandeDate** (comme le tableau Bilans),
           * pas sur paiementDate — aligne lignes et totaux.
           */
          basis: 'commande',
        }
      : {
          /**
           * IMPORTANT (affichage du tableau inchangé):
           * - Le tableau Bilans affiche Articles/Quantité/Prix via `paiement.commande.items`.
           * - En backend, `deep=0` (mode résumé) n'inclut pas `items` pour économiser la RAM.
           * - Donc ici on force `deep=1` même sans filtre date, afin que le tableau
           *   reste affiché exactement comme avant (avec les articles).
           *
           * Optimisation:
           * - On reste paginé (25 lignes) pour éviter un payload énorme.
           * - Les totaux globaux, eux, viennent de `stats=bilans` (fiables et légers).
           */
          paged: 1,
          page: 1,
          limit: 25,
          deep: 1,
        };
  const depensesParams =
    startDate && endDate
      ? {
          /**
           * Dépenses:
           * - Le tableau Bilans n'affiche pas la liste des dépenses, seulement le total.
           * - Donc on n'a PAS besoin de `export=1` ici (ça renverrait toutes les lignes inutilement).
           * - On limite volontairement la page à 1 ligne, mais les `totals` (serveur) restent justes.
           */
          paged: 1,
          page: 1,
          limit: 1,
          from: startDate,
          to: endDate,
        }
      : { paged: 1, page: 1, limit: 25 };

  const { data: paiementsData, isLoading, error } = useAllPaiements(
    paiementsParams
  );
  const { data: depenseData } = useAllDepenses(depensesParams);

  /**
   * IMPORTANT (règle métier demandée):
   * - chiffre d'affaire = Σ factures.totalAmount (net après réduction, pas le brut commande)
   * - revenu            = Σ factures.totalPaye
   *
   * Donc on récupère les commandes + factures via la MÊME API commandes
   * (sans changer l'URL, seulement un paramètre optionnel `facturesTotals=1`).
   */
  const { data: commandesData } = useAllCommandes({
    paged: 1,
    export: 1,
    from: startDate,
    to: endDate,
    // Demande au backend de renvoyer `factures.totalPaye` (sinon factures est "light").
    facturesTotals: 1,
  });

  // Totaux fiables (serveur) pour Bilans.
  // NB: Si from/to ne sont pas définis, le backend limite par défaut aux 7 derniers jours.
  const { data: paiementsStats } = useAllPaiements({
    stats: 'bilans',
    from: startDate ?? undefined,
    to: endDate ?? undefined,
    basis: 'commande',
  });
  const tableRef = useRef(null);
  // State de Recherche

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
  // Paiements filtrés (la majorité du filtre est déjà faite côté serveur quand start/end sont fournis)
  const filterPaiement = paiementsData?.paiements?.filter((item) => {
    return isBetweenDates(item.commande?.commandeDate);
  });

  // Fonction de Rechercher
  const filterDepense = (depenseData?.items || depenseData || [])?.filter(
    (item) => {
    // Filtrer par date
    return isBetweenDates(item?.dateOfDepense);
  });

  /**
   * Totaux:
   * - On lit d’abord `paiementsStats` (agrégat serveur) en forçant un nombre avec `asMoneyNumber`
   *   (les montants ne sont pas toujours des `number` JS stricts après JSON / cache).
   * - Si la clé est absente ou non numérique (ex. placeholder React Query d’une autre forme de réponse),
   *   on retombe sur la somme des **lignes du tableau** (même périmètre que l’affichage).
   */
  const sumTotalAmountFromLines = () =>
    (filterPaiement ?? []).reduce(
      (acc, item) => acc + asMoneyNumber(item?.totalAmount),
      0
    );
  const sumTotalPayeFromLines = () =>
    (filterPaiement ?? []).reduce(
      (acc, item) => acc + asMoneyNumber(item?.totalPaye),
      0
    );

  const sumTotalAmount =
    paiementsStats != null &&
    paiementsStats.sumTotalAmount != null &&
    Number.isFinite(Number(paiementsStats.sumTotalAmount))
      ? asMoneyNumber(paiementsStats.sumTotalAmount)
      : sumTotalAmountFromLines();

  const sumTotalPaye =
    paiementsStats != null &&
    paiementsStats.sumTotalPaye != null &&
    Number.isFinite(Number(paiementsStats.sumTotalPaye))
      ? asMoneyNumber(paiementsStats.sumTotalPaye)
      : sumTotalPayeFromLines();

  const sumTotalDepense =
    depenseData?.totals?.sumTotalExpense != null &&
    Number.isFinite(Number(depenseData.totals.sumTotalExpense))
      ? asMoneyNumber(depenseData.totals.sumTotalExpense)
      : (filterDepense ?? []).reduce(
          (acc, item) => acc + asMoneyNumber(item?.totalAmount),
          0
        );

  /**
   * --- Définitions affichage Bilans (une ligne = un paiement lié à une commande) ---
   * Chiffre d'affaires : Σ montants dus **nets** sur facture (hors réduction affichée à part).
   * Revenu           : Σ encaissements (`totalPaye`).
   * Réliquat         : Σ max(0, net dû − payé).
   */
  const facturesPourTotaux = commandesData?.factures || [];
  const chiffreAffairesTotalCommandesAvecImpaye =
    facturesPourTotaux.length > 0
      ? sumNetDueFromFactures(facturesPourTotaux)
      : paiementsStats != null &&
          paiementsStats.sumTotalAmount != null &&
          Number.isFinite(Number(paiementsStats.sumTotalAmount))
        ? asMoneyNumber(paiementsStats.sumTotalAmount)
        : sumTotalAmountFromLines();
  const revenuTotalMontantsPayes = (commandesData?.factures || []).reduce(
    (acc, f) => acc + asMoneyNumber(f?.totalPaye),
    0
  );
  const reliquatSommeImpayes =
    facturesPourTotaux.length > 0
      ? sumReliquatFromFactures(facturesPourTotaux)
      : paiementsStats != null &&
          paiementsStats.sumReliquat != null &&
          Number.isFinite(Number(paiementsStats.sumReliquat))
        ? asMoneyNumber(paiementsStats.sumReliquat)
        : (filterPaiement ?? []).reduce(
            (acc, item) =>
              acc +
              Math.max(
                0,
                asMoneyNumber(item?.totalAmount) - asMoneyNumber(item?.totalPaye)
              ),
            0
          );

  const totalReduction =
    facturesPourTotaux.length > 0
      ? sumReductionFromRows(facturesPourTotaux)
      : paiementsStats != null &&
          paiementsStats.sumReduction != null &&
          Number.isFinite(Number(paiementsStats.sumReduction))
        ? asMoneyNumber(paiementsStats.sumReduction)
        : sumReductionFromRows(filterPaiement);

  const { totalAchat, benefice } = useMemo(() => {
    // Chemin optimisé: le serveur renvoie directement `totalAchat` (agrégation).
    if (
      paiementsStats?.totalAchat != null &&
      Number.isFinite(Number(paiementsStats.totalAchat))
    ) {
      const ta = asMoneyNumber(paiementsStats.totalAchat);
      const total = sumTotalPaye - ta;
      const benefice = total - sumTotalDepense;
      return { totalAchat: ta, benefice };
    }

    /**
     * Fallback (ancien comportement):
     * - Calcul côté front uniquement si `paiementsStats` indisponible.
     * - On garde les protections anti-crash.
     */
    const paiementsArray = Array.isArray(paiementsData?.paiements)
      ? paiementsData.paiements
      : [];
    const paiementsFiltres = paiementsArray.filter((item) => {
      return isBetweenDates(item?.commande?.commandeDate);
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
    const total = sumTotalPaye - totalAchat;
    const benefice = total - sumTotalDepense;
    return { totalAchat, benefice };
  }, [paiementsStats, paiementsData, isBetweenDates, sumTotalPaye, sumTotalDepense]);

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
                              {formatPrice(
                                /**
                                 * IMPORTANT (règle métier):
                                 * - Ici on veut le NOMBRE TOTAL de commandes enregistrées sur la période,
                                 *   pas le nombre de paiements.
                                 * - L'API commandes paginée renvoie `total` (compteur global sur le filtre),
                                 *   sinon on retombe sur la longueur de `commandesListe`.
                                 */
                                commandesData?.total ??
                                  (commandesData?.commandesListe || []).length
                              )}
                            </span>
                          </h6>
                          <h6 className=''>
                            Chiffre d'Affaire:{' '}
                            <span className='text-info'>
                              {formatPrice(chiffreAffairesTotalCommandesAvecImpaye)} F{' '}
                            </span>
                          </h6>
                          <h6 className=''>
                            Revenu :{' '}
                            <span className='text-success'>
                              {formatPrice(revenuTotalMontantsPayes)} F{' '}
                            </span>
                          </h6>
                          <h6 className=''>
                            Total Achats :{' '}
                            <span className='text-success'>
                              {formatPrice(totalAchat)} F{' '}
                            </span>
                          </h6>
                          <h6 className=''>
                            Total de Réduction :{' '}
                            <span className='text-warning'>
                              {formatPrice(totalReduction)} F{' '}
                            </span>
                          </h6>
                          <h6 className=''>
                            Réliquat:{' '}
                            <span className='text-danger'>
                              {formatPrice(reliquatSommeImpayes)} F{' '}
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

                            <th data-sort='totaAmount'>Montant dû</th>
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
                                <td>
                                  {formatPrice(paiement?.totalPaye)}
                                  {' F '}
                                </td>
                                <td>
                                  {asMoneyNumber(paiement?.totalAmount) -
                                    asMoneyNumber(paiement?.totalPaye) >
                                  0 ? (
                                    <span className='text-danger'>
                                      {' '}
                                      {formatPrice(
                                        asMoneyNumber(paiement?.totalAmount) -
                                          asMoneyNumber(paiement?.totalPaye)
                                      )}
                                      {' F '}
                                    </span>
                                  ) : (
                                    <span>
                                      {' '}
                                      {formatPrice(
                                        asMoneyNumber(paiement?.totalAmount) -
                                          asMoneyNumber(paiement?.totalPaye)
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
