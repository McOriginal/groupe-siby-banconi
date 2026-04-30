import { Card, CardBody, CardImg, CardTitle } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';

import articleImg from './../../assets/images/package.png';
import { useDashboardLowStockProduitCount } from '../../Api/queriesDashboard';
import { useNavigate } from 'react-router-dom';
import { connectedUserRole } from '../Authentication/userInfos';

export default function TotalArticleSansStock() {
  /**
   * MODIF (Dashboard perf/RAM + réseau)
   * ----------------------------------
   * Avant: on chargeait TOUS les produits (`getAllProduits`) puis on filtrait `stock <= 10`.
   * Double problème:
   * - grosse liste -> cache React Query -> RAM inutile
   * - filtrage en front alors qu'un endpoint existe déjà côté backend
   *
   * Maintenant:
   * - on utilise l'endpoint EXISTANT `getAllProduitWithStockFinish` via un hook dashboard
   * - on ne conserve en cache que le compteur `{ total }`
   *
   * NB: on ne change pas le backend, on réutilise juste une route existante.
   */
  const {
    data: lowStockCount,
    isLoading: productLoading,
    error: productError,
  } = useDashboardLowStockProduitCount();
  const navigate = useNavigate();

  const handleNavigate = () => {
    return navigate('/produit_no_stock');
  };

  return (
    <div
      onClick={() => connectedUserRole === 'admin' && handleNavigate()}
      style={{ cursor: 'pointer' }}
    >
      {productLoading && <LoadingSpiner />}
      {!productError && !productLoading && (
        <Card
          style={{
            height: '180px',
            boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
          }}
        >
          <CardImg
            src={articleImg}
            alt='articles'
            style={{ height: '90px', objectFit: 'contain' }}
          />
          <CardBody>
            <CardTitle className='text-center'>
              {/* MODIF: on affiche directement le total des produits "stock faible" */}
              <span className='text-danger fs-5'>
                {lowStockCount?.total ?? 0}
              </span>
              <p>Produits En Stock Faible</p>
            </CardTitle>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
