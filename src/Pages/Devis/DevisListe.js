import React, { useRef } from 'react';
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
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';

import html2pdf from 'html2pdf.js';
import { useReactToPrint } from 'react-to-print';
import { useAllDevis, useDeleteDevis } from '../../Api/queriesDevis';
import { useNavigate } from 'react-router-dom';
import { deleteButton } from '../components/AlerteModal';
import FactureHeader from '../Commandes/Details/FactureHeader';
import LogoFiligran from '../Commandes/Details/LogoFiligran';
import { companyName } from '../CompanyInfo/CompanyInfo';

// Export En PDF
// ------------------------------------------
// ------------------------------------------
const exportPDFFacture = () => {
  const element = document.getElementById('facture');
  const opt = {
    filename: 'Facture_de_Devis.pdf',
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

// ----------------------------------------
// ----------------------------------------
// ----------------------------------------
export default function DevisListe() {
  // Afficher tous les Devis
  const { data: devisData, isLoading, error } = useAllDevis();
  const { mutate: deleteDevis } = useDeleteDevis();
  const contentRef = useRef();
  const reactToPrintFn = useReactToPrint({ contentRef });

  const navigate = useNavigate();

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Devis' breadcrumbItem='Liste de Devis' />

          {error && (
            <div className='text-danger text-center'>
              Erreur de chargement des données
            </div>
          )}
          {isLoading && <LoadingSpiner />}
          {!error && devisData?.length === 0 && (
            <div className='mt-4 d-flex justify-content-center align-items-center flex-column'>
              <p className='text-center font-size-18 text-danger'>
                Aucun Devis enregistré !
              </p>

              <Button
                color='info'
                className='add-btn mt-2'
                onClick={() => navigate('/newDevis')}
              >
                <i className='fas fa-plus align-center me-1'></i> Ajouter un
                Devis
              </Button>
            </div>
          )}
          {devisData?.length > 0 &&
            devisData?.map((dev, index) => (
              <div
                key={index}
                className='d-flex flex-column justify-content-center my-4'
              >
                {/* // Bouton */}
                <Col className='col-sm-auto mb-3'>
                  <div className='d-flex gap-4  justify-content-center align-items-center'>
                    <Button
                      color='info'
                      className='add-btn'
                      id='create-btn'
                      onClick={reactToPrintFn}
                    >
                      <i className='fas fa-print align-center me-1'></i>{' '}
                      Imprimer
                    </Button>

                    <Button color='danger' onClick={exportPDFFacture}>
                      <i className='fas fa-paper-plane  me-1 '></i>
                      Télécharger en PDF
                    </Button>
                  </div>
                </Col>
                {/* // ------------------------------------------- */}
                <Col className='col-sm-auto mt-4'>
                  <div className='d-flex gap-4  justify-content-center align-items-center'>
                    <Button
                      color='warning'
                      onClick={() => navigate(`/updateDevis/${dev?._id}`)}
                    >
                      <i className='fas fa-edit align-center me-1'></i> Modifier
                    </Button>

                    <Button
                      color='danger'
                      onClick={() => {
                        deleteButton(dev?._id, 'Ce Devis', deleteDevis);
                      }}
                    >
                      <i className='fas fa-trash  me-1 '></i>
                      Supprimer
                    </Button>
                  </div>
                </Col>
                {/* // ------------------------------------------- */}
                <div ref={contentRef} id='Facture_de_Devis'>
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
                      <div className='d-flex justify-content-between align-item-center mt-2'>
                        <CardText className='font-size-14'>
                          <strong>Motif: </strong> Devis pour:
                        </CardText>
                        <CardText>
                          <strong> Date:</strong>{' '}
                          {new Date(dev.createdAt).toLocaleDateString()}
                        </CardText>
                      </div>
                      {/* Infos Client */}
                      <div className='d-flex justify-content-between align-item-center  '>
                        <CardText>
                          <strong>Client: </strong>
                          {capitalizeWords(dev?.fullName) ||
                            '-------------------'}{' '}
                        </CardText>
                        <CardText className='me-2'>
                          <strong>Tél: </strong>
                          {formatPhoneNumber(dev?.phoneNumber) ||
                            '----------------'}
                        </CardText>
                      </div>
                      <CardText className='text-start'>
                        <strong>Adresse: </strong>
                        {capitalizeWords(dev?.adresse) || '--------------'}
                      </CardText>

                      {/* Logo Filigrant */}
                      <LogoFiligran />

                      <div className='my-2 p-2'>
                        <table className='table align-middle table-nowrap table-hover table-bordered border-2 border-info text-center'>
                          <thead>
                            <tr>
                              <th>Qté</th>
                              <th>Désignations</th>
                              <th>P.U</th>
                              <th>Montant</th>
                            </tr>
                          </thead>

                          <tbody>
                            {dev?.items.map((article) => (
                              <tr key={article._id}>
                                <td>{article?.quantity} </td>
                                <td className='text-wrap'>
                                  {capitalizeWords(article?.produit?.name)}{' '}
                                </td>
                                <td>
                                  {formatPrice(article?.customerPrice)} F{' '}
                                </td>
                                <td>
                                  {formatPrice(
                                    article?.customerPrice * article?.quantity
                                  )}
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
                                {' '}
                                {formatPrice(dev?.totalAmount)} F{' '}
                              </strong>{' '}
                            </CardText>
                          </div>
                        </div>
                        <p className='font-size-10 text-center'>
                          Merci pour votre confiance et votre achat chez{' '}
                          {companyName}. Nous espérons vous revoir bientôt!
                        </p>
                      </CardFooter>
                    </CardBody>
                  </Card>
                </div>
              </div>
            ))}
        </Container>
      </div>
    </React.Fragment>
  );
}
