import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardText,
  Col,
  Container,
} from 'reactstrap';
import Breadcrumbs from '../../../components/Common/Breadcrumb';

import LoadingSpiner from '../../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../../components/capitalizeFunction';
import { useOneCommande } from '../../../Api/queriesCommande';
import { useParams } from 'react-router-dom';
import React from 'react';
import html2pdf from 'html2pdf.js';

import PaiementsHistorique from '../PaiementsHistorique/PaiementsHistorique';
import LivraisonHistorique from '../Livraison/ListeLivraisonHistorique';

import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { companyName } from '../../CompanyInfo/CompanyInfo';
import FactureHeader from './FactureHeader';
import LogoFiligran from './LogoFiligran';

export default function Facture() {
  const { id } = useParams();
  const { data: selectedCommande, isLoading, error } = useOneCommande(id);
  const contentRef = useRef();
  const reactToPrintFn = useReactToPrint({ contentRef });

  // ------------------------------------------
  // ------------------------------------------
  // Export En PDF
  // ------------------------------------------
  // ------------------------------------------
  const exportPDFFacture = () => {
    const element = document.getElementById('facture');
    const opt = {
      filename: 'facture.pdf',
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
          <Breadcrumbs title='Commande' breadcrumbItem='Factures' />

          <Col className='col-sm-auto mb-3'>
            <div className='d-flex gap-4  justify-content-center align-items-center'>
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

          <div ref={contentRef} id='facture'>
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
                  {selectedCommande?.commandeData?.statut === 'livré' &&
                    selectedCommande?.paiementCommande?.totalAmount -
                      selectedCommande?.paiementCommande?.totalPaye ===
                      0 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '20px',
                          transform: 'rotate(-45deg)',
                          opacity: '0.5',
                          border: '1px dashed #022f72',
                          color: ' #022f72',
                          fontSize: ' 34px',
                          fontweight: 'bold',
                          width: '100%',
                          textAlign: 'cente',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <p> Payé et Livré</p>
                      </div>
                    )}

                  {/* Payé Non Livré */}
                  {selectedCommande?.commandeData?.statut === 'en attente' &&
                    selectedCommande?.paiementCommande?.totalAmount -
                      selectedCommande?.paiementCommande?.totalPaye ===
                      0 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '20px',
                          transform: 'rotate(-45deg)',
                          opacity: '0.5',
                          border: '1px dashed #720202',
                          color: ' #720202',
                          fontSize: ' 34px',
                          fontweight: 'bold',
                          width: '100%',
                          textAlign: 'cente',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <p> Payé Non Livré</p>
                      </div>
                    )}

                  {/* Payé Non Livré */}
                  <div className=' my-2 px-2 '>
                    <div className='d-flex justify-content-between align-item-center mt-2'>
                      <CardText>
                        <strong>Facture N°: </strong>
                        <span className='text-danger'>
                          {formatPrice(
                            selectedCommande?.commandeData?.commandeId
                          )}{' '}
                        </span>
                      </CardText>
                      <CardText>
                        <strong> Date:</strong>{' '}
                        {new Date(
                          selectedCommande?.commandeData?.commandeDate
                        ).toLocaleDateString()}
                      </CardText>
                    </div>

                    {/* Infos Client */}
                    <div className='d-flex justify-content-between align-item-center  '>
                      <CardText>
                        <strong>Client: </strong>
                        {capitalizeWords(
                          selectedCommande?.commandeData?.fullName
                        )}{' '}
                      </CardText>
                      <CardText>
                        <strong>Tél: </strong>
                        {formatPhoneNumber(
                          selectedCommande?.commandeData?.phoneNumber
                        )}
                      </CardText>
                    </div>
                    <CardText className='text-start'>
                      <strong>Adresse : </strong>
                      {capitalizeWords(selectedCommande?.commandeData?.adresse)}
                    </CardText>
                  </div>
                  {/* Bordure Séparateur */}
                  {/* Logo en Filigrant */}
                  <LogoFiligran />
                  <div className='my-2 p-2'>
                    <table className='table align-middle table-nowrap table-hover table-bordered border-2 border-double border-info text-center'>
                      <thead>
                        <tr>
                          <th>Qté</th>
                          <th>Désignations</th>
                          <th>P.U</th>
                          <th>Montant</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedCommande?.commandeData?.items?.map(
                          (article) => (
                            <tr key={article?._id}>
                              <td>{article?.quantity} </td>
                              <td className='text-wrap'>
                                {capitalizeWords(article?.produit?.name)}{' '}
                              </td>
                              <td>{formatPrice(article?.customerPrice)} F </td>
                              <td>
                                {formatPrice(
                                  article?.customerPrice * article?.quantity
                                )}
                                {' F'}
                              </td>
                            </tr>
                          )
                        )}
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
                            {formatPrice(
                              selectedCommande?.paiementCommande
                                ? selectedCommande?.paiementCommande
                                    ?.totalAmount
                                : selectedCommande?.commandeData?.totalAmount
                            )}{' '}
                            F
                          </strong>
                        </CardText>
                        <div>
                          <CardText className='text-center '>
                            Payé:
                            <strong style={{ fontSize: '14px' }}>
                              {' '}
                              {selectedCommande?.paiementCommande
                                ? formatPrice(
                                    selectedCommande?.paiementCommande
                                      ?.totalPaye
                                  )
                                : 0}{' '}
                              F
                            </strong>
                          </CardText>
                          <CardText className='text-center '>
                            Reliquat:
                            <strong style={{ fontSize: '14px' }}>
                              {' '}
                              {formatPrice(
                                selectedCommande?.paiementCommande
                                  ? selectedCommande?.paiementCommande
                                      ?.totalAmount -
                                      selectedCommande?.paiementCommande
                                        ?.totalPaye
                                  : selectedCommande?.commandeData?.totalAmount
                              )}{' '}
                              F
                            </strong>
                          </CardText>
                        </div>
                      </div>
                    </div>
                    <p className=' mt-2 text-info'>
                      Arrêté la présente facture à la somme de:{' '}
                      <strong style={{ fontSize: '14px' }}>
                        {formatPrice(
                          selectedCommande?.paiementCommande
                            ? selectedCommande?.paiementCommande?.totalAmount
                            : selectedCommande?.commandeData?.totalAmount
                        )}{' '}
                        F
                      </strong>
                    </p>
                    <p className='font-size-10 text-center'>
                      Merci pour votre confiance et votre achat chez{' '}
                      {companyName}. Nous espérons vous revoir bientôt!
                    </p>
                  </CardFooter>
                </CardBody>
              </Card>
            )}
          </div>
          {/* Historique de Paiement */}
          <PaiementsHistorique
            id={id}
            reliqua={
              selectedCommande?.paiementCommande
                ? selectedCommande?.paiementCommande?.totalAmount -
                  selectedCommande?.paiementCommande?.totalPaye
                : selectedCommande?.commandeData?.totalAmount
            }
            boutique={selectedCommande?.commandeData?.user?.boutique}
          />
          {/* Historique de Paiement */}

          {/* Historique de Lvraison */}
          <LivraisonHistorique
            id={id}
            commandeItems={selectedCommande?.commandeData}
          />
          {/* Historique de Lvraison */}
        </Container>
      </div>
    </React.Fragment>
  );
}
