import { Card, CardBody, CardImg, CardTitle } from 'reactstrap';
import { useDashboardFournisseurCount } from '../../Api/queriesDashboard';
import fourImg from './../../assets/images/delivery.png';
import LoadingSpiner from '../components/LoadingSpiner';
import { useNavigate } from 'react-router-dom';
import { connectedUserRole } from '../Authentication/userInfos';

export default function TotalFounisseurs() {
  /**
   * MODIF (Dashboard perf/RAM)
   * -------------------------
   * Avant: `useAllFournisseur()` ramenait tous les fournisseurs puis on faisait `length`.
   * Maintenant: hook dashboard -> ne garde en cache que `{ total }`.
   * Backend inchangé (contrainte respectée).
   */
  const {
    data: fournisseurCount,
    isLoading: fournisseurLoading,
    error: fournisseurError,
  } = useDashboardFournisseurCount();
  const navigate = useNavigate();

  const handleNavigate = () => {
    return navigate('/fournisseurs');
  };
  return (
    <div
      onClick={() => connectedUserRole === 'admin' && handleNavigate()}
      style={{ cursor: 'pointer' }}
    >
      {fournisseurLoading && <LoadingSpiner />}
      {!fournisseurError && !fournisseurLoading && (
        <Card
          style={{
            height: '180px',
            boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
          }}
        >
          <CardImg
            src={fourImg}
            alt='Fournisseurs'
            style={{ height: '90px', objectFit: 'contain' }}
          />
          <CardBody>
            <CardTitle className='text-center'>
              {/* MODIF: compteur direct, pas une grosse liste */}
              <span className='text-info fs-5'>
                {fournisseurCount?.total ?? 0}
              </span>
              <p>Fournisseurs</p>
            </CardTitle>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
