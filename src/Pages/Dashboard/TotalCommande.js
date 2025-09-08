import { Card, CardBody, CardImg, CardTitle } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';

import comImg from './../../assets/images/passer-la-commande.png';
import rechargeImg from './../../assets/images/recharge.png';
import carImg from './../../assets/images/car.png';
import { useAllCommandes } from '../../Api/queriesCommande';
import { useNavigate } from 'react-router-dom';

const TotalCommande = () => {
  const {
    data: commandeData,
    isLoading: loadingCommande,
    error: commandeError,
  } = useAllCommandes();
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
                {commandeData?.commandesListe?.length}
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
    data: commandeData,
    isLoading: loadingCommande,
    error: commandeError,
  } = useAllCommandes();
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
                {
                  commandeData?.commandesListe?.filter(
                    (cmd) => cmd.status === 'en attente'
                  ).length
                }
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
    data: commandeData,
    isLoading: loadingCommande,
    error: commandeError,
  } = useAllCommandes();
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
                {
                  commandeData?.commandesListe?.filter(
                    (cmd) => cmd?.status === 'en cours'
                  )?.length
                }
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
