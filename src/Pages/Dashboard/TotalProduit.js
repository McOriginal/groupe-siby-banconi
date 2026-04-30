import { Card, CardBody, CardImg, CardTitle } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';

import produitImage from './../../assets/images/product.png';
import { useDashboardProduitCount } from '../../Api/queriesDashboard';
import { useNavigate } from 'react-router-dom';

export default function TotalProduit() {
  /**
   * MODIF (Dashboard perf/RAM)
   * -------------------------
   * Avant: `useAllProduit()` ramenait la liste complète des produits puis on faisait `length`.
   * Problème: la grosse liste finissait dans le cache React Query => consommation RAM inutile.
   *
   * Maintenant: on utilise un hook dédié dashboard qui retourne UNIQUEMENT `{ total }`.
   * Contrainte respectée: on ne change pas le backend ni ses variables, uniquement le front.
   */
  const {
    data: produitCount,
    isLoading: produitLoading,
    error: produitError,
  } = useDashboardProduitCount();

  const navigate = useNavigate();

  const handleNavigate = () => {
    return navigate('/produits');
  };

  return (
    <div onClick={() => handleNavigate()} style={{ cursor: 'pointer' }}>
      {produitLoading && <LoadingSpiner />}
      {!produitError && !produitLoading && (
        <Card
          style={{
            height: '180px',
            boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
          }}
        >
          <CardImg
            src={produitImage}
            alt='product'
            style={{ height: '90px', objectFit: 'contain' }}
          />
          <CardBody>
            <CardTitle className='text-center'>
              {/* MODIF: on affiche le compteur (et plus la taille d'une grosse liste) */}
              <span className='text-info fs-5'>{produitCount?.total ?? 0}</span>
              <p>Produits</p>
            </CardTitle>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
