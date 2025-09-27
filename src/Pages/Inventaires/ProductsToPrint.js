import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardText,
  Col,
  Container,
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';

import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';
import React from 'react';
import html2pdf from 'html2pdf.js';

import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import FactureHeader from '../Commandes/Details/FactureHeader';
import LogoFiligran from '../Commandes/Details/LogoFiligran';
import { useAllProduit } from '../../Api/queriesProduits';
import BackButton from '../components/BackButton';

export default function ProductsToPrint() {
  const { data: produits, isLoading, error } = useAllProduit();

  const contentRef = useRef();
  const reactToPrintFn = useReactToPrint({ contentRef });

  // ------------------------------------------
  // ------------------------------------------
  // Export En PDF
  // ------------------------------------------
  // ------------------------------------------
  const exportPDFFacture = () => {
    const element = document.getElementById('produits');
    const opt = {
      filename: 'produits.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .catch((err) => console.error('Error generating PDF:', err));
  };

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs
            title='Inventaire'
            breadcrumbItem='Liste des  Produits'
          />

          <Col className='col-sm-auto mb-3'>
            <div className='d-flex gap-4  justify-content-center align-items-center'>
              <BackButton />
              <Button
                color='info'
                className='add-btn'
                id='create-btn'
                onClick={reactToPrintFn}
              >
                <i className='fas fa-print align-center me-1'></i> Imprimer
              </Button>

              <Button color='danger' onClick={exportPDFFacture}>
                <i className='fas fa-paper-plane  me-1 '></i>
                Télécharger en PDF
              </Button>
            </div>
          </Col>

          {error && (
            <div className='text-danger text-center'>
              Erreur de chargement des données
            </div>
          )}
          {isLoading && <LoadingSpiner />}

          <div ref={contentRef} id='produits'>
            {!error && !isLoading && (
              <Card
                className='d-flex justify-content-center border border-info'
                style={{
                  boxShadow: '0px 0px 10px rgba(100, 169, 238, 0.5)',
                  borderRadius: '15px',
                  width: '583px',
                  margin: '5px auto',
                  position: 'relative',
                }}
              >
                <CardBody>
                  <FactureHeader />

                  {/* Bordure Séparateur */}
                  {/* Logo en Filigrant */}
                  <LogoFiligran />
                  <div className='my-2 p-2'>
                    <table className='table align-middle table-nowrap table-hover table-bordered border-2 border-double border-info text-center'>
                      <thead>
                        <tr>
                          <th>Stock</th>
                          <th>Désignations</th>
                          <th>Prix d'Achat</th>
                          <th>Prix de Vente</th>
                        </tr>
                      </thead>

                      <tbody>
                        {produits?.map((article) => (
                          <tr key={article?._id}>
                            <td>{article?.stock} </td>
                            <td className='text-wrap'>
                              {capitalizeWords(article?.name)}{' '}
                            </td>
                            <td>{formatPrice(article?.achatPrice)} F </td>
                            <td>
                              {formatPrice(article?.price)}
                              {' F'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <CardFooter>
                    <div className='p-1'>
                      <div
                        className='d-flex
                  justify-content-between align-item-center'
                      >
                        <CardText className={'text-center'}>
                          Total:{' '}
                          <strong style={{ fontSize: '14px' }}>
                            {formatPrice(produits?.length)}
                          </strong>
                        </CardText>
                      </div>
                    </div>
                  </CardFooter>
                </CardBody>
              </Card>
            )}
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
