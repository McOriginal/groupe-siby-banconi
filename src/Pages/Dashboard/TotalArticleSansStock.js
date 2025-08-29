import { Card, CardBody, CardImg, CardTitle } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';

import articleImg from './../../assets/images/package.png';
import { useAllProduit } from '../../Api/queriesProduits';

export default function TotalArticleSansStock() {
  // Article Data
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = useAllProduit();

  const finishStock = productData?.filter((item) => item.stock <= 10);

  return (
    <div>
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
              <span className='text-danger fs-5'>{finishStock?.length}</span>
              <p>Produits En Stock Faible</p>
            </CardTitle>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
