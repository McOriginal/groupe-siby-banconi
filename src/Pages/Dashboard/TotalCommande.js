import { Card, CardBody, CardImg, CardTitle } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';

import comImg from './../../assets/images/passer-la-commande.png';
import rechargeImg from './../../assets/images/recharge.png';
import carImg from './../../assets/images/car.png';
import { useDashboardCommandeCounts } from '../../Api/queriesDashboard';
import { useNavigate } from 'react-router-dom';

const TotalCommande = () => {
  /**
   * MODIF (Dashboard perf/RAM)
   * -------------------------
   * Avant: `useAllCommandes()` mettait en cache `{ commandesListe, factures }` (potentiellement très lourd)
   * et on utilisait seulement `.length` / `.filter().length`.
   *
   * Maintenant: `useDashboardCommandeCounts()` calcule et retourne UNIQUEMENT:
   * - total
   * - enAttente
   * - enCours
   *
   * Résultat: cache React Query beaucoup plus petit, re-renders plus rapides.
   * Contrainte respectée: aucune modification backend.
   */
  const {
    data: commandeCounts,
    isLoading: loadingCommande,
    error: commandeError,
  } = useDashboardCommandeCounts();
  const navigate = useNavigate();

  const handleNavigate = () => {
    return navigate('/commandes');
  };

  return (
    <div onClick={() => handleNavigate()} style={{ cursor: 'pointer' }}>
      {loadingCommande && <LoadingSpiner />}
      {!commandeError && !loadingCommande && (
        <Card
          style={{
            height: '180px',
            boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
          }}
        >
          <CardImg
            src={comImg}
            alt='Commandes'
            style={{ height: '90px', objectFit: 'contain' }}
          />
          <CardBody>
            <CardTitle className='text-center'>
              <span className='text-info fs-5'>
                {/* MODIF: total direct (pas besoin de garder commandesListe en mémoire) */}
                {commandeCounts?.total ?? 0}
              </span>
              <p>Commandes Enregistrées</p>
            </CardTitle>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
const TotalCommandeNotDelivred = () => {
  const {
    data: commandeCounts,
    isLoading: loadingCommande,
    error: commandeError,
  } = useDashboardCommandeCounts();
  const navigate = useNavigate();

  const handleNavigate = () => {
    return navigate('/commandes');
  };

  return (
    <div onClick={() => handleNavigate()} style={{ cursor: 'pointer' }}>
      {loadingCommande && <LoadingSpiner />}
      {!commandeError && !loadingCommande && (
        <Card
          className='d-flex flex-column align-items-center justify-content-center'
          style={{
            height: '180px',
            boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
          }}
        >
          <CardImg
            src={rechargeImg}
            alt='Commandes'
            style={{ height: '110px', objectFit: 'contain' }}
          />
          <CardBody>
            <CardTitle className='text-center'>
              <span className='text-danger fs-5'>
                {/* MODIF: plus de filter() sur une grosse liste, on utilise le compteur préparé */}
                {commandeCounts?.enAttente ?? 0}
              </span>
              <p>Commandes Non Livrés</p>
            </CardTitle>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
const TotalCommandeToDelivre = () => {
  const {
    data: commandeCounts,
    isLoading: loadingCommande,
    error: commandeError,
  } = useDashboardCommandeCounts();
  const navigate = useNavigate();

  const handleNavigate = () => {
    return navigate('/commandes');
  };

  return (
    <div onClick={() => handleNavigate()} style={{ cursor: 'pointer' }}>
      {loadingCommande && <LoadingSpiner />}
      {!commandeError && !loadingCommande && (
        <Card
          className='d-flex flex-column align-items-center justify-content-center'
          style={{
            height: '180px',
            boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
          }}
        >
          <CardImg
            src={carImg}
            alt='Commandes'
            style={{ height: '110px', objectFit: 'cover' }}
          />
          <CardBody>
            <CardTitle className='text-center'>
              <span className='text-warning fs-5'>
                {/* MODIF: compteur direct "en cours" */}
                {commandeCounts?.enCours ?? 0}
              </span>
              <p>Commandes En Cours</p>
            </CardTitle>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export { TotalCommande, TotalCommandeNotDelivred, TotalCommandeToDelivre };
