import { Button, Card, CardBody, CardText, Modal } from 'reactstrap';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';
import html2pdf from 'html2pdf.js';

import { useOnePaiement } from '../../Api/queriesPaiement';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import FactureHeader from '../Commandes/Details/FactureHeader';

const ReçuPaiement = ({ show_modal, tog_show_modal, selectedPaiementID }) => {
  const {
    data: selectedPaiement,
    error,
    isLoading,
  } = useOnePaiement(selectedPaiementID);

  const contentRef = useRef();
  const reactToPrintFn = useReactToPrint({ contentRef });

  // ------------------------------------------
  // ------------------------------------------
  // Export En PDF
  // ------------------------------------------
  // ------------------------------------------
  const exportPaiementToPDF = () => {
    const element = document.getElementById('reçupaiement');
    const opt = {
      filename: 'reçupaiement.pdf',
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
    <Modal
      isOpen={show_modal}
      toggle={() => {
        tog_show_modal();
      }}
      size={'lg'}
      scrollable={true}
      centered={true}
    >
      {/* ---- Modal Header */}
      <div className='modal-header'>
        <div className='d-flex gap-1 justify-content-around align-items-center w-100'>
          <Button
            color='info'
            className='add-btn'
            id='create-btn'
            onClick={reactToPrintFn}
          >
            <i className='fas fa-print align-center me-1'></i> Imprimer
          </Button>

          <Button color='danger' onClick={exportPaiementToPDF}>
            <i className='fas fa-paper-plane  me-1 '></i>
            Télécharger en PDF
          </Button>
        </div>

        <button
          type='button'
          onClick={() => tog_show_modal()}
          className='close'
          data-dismiss='modal'
          aria-label='Close'
        >
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>

      {/* Modal Body */}
      <div className='modal-body' ref={contentRef}>
        {!error && !isLoading && (
          <div
            className='mx-5 py-3 d-flex justify-content-center'
            id='reçupaiement'
          >
            <Card
              style={{
                boxShadow: '0px 0px 10px rgba(100, 169, 238, 0.5)',
                borderRadius: '15px',
                width: '583px',
                margin: '20px auto',
                position: 'relative',
                padding: '10px 0',
              }}
            >
              <CardBody>
                <FactureHeader />

                <div
                  sm='12'
                  className='d-flex justify-content-around align-items-center mt-4 px-2 '
                >
                  <div>
                    <CardText>
                      <strong> Nom et Prénom:</strong>{' '}
                      {capitalizeWords(selectedPaiement?.commande?.fullName)}
                    </CardText>
                    <CardText>
                      <strong> Adresse:</strong>{' '}
                      {capitalizeWords(selectedPaiement?.commande?.adresse)}
                    </CardText>
                  </div>
                  <div
                    className='border border-1 border-dark'
                    style={{ width: '2px', height: '100px' }}
                  ></div>

                  <div className='my-3'>
                    <CardText>
                      <strong> Total Facture: </strong>
                      {formatPrice(selectedPaiement?.totalAmount)} F
                    </CardText>
                    <CardText>
                      <strong> Payé: </strong>
                      {formatPrice(selectedPaiement?.totalPaye)} F
                    </CardText>
                    <CardText>
                      <strong> Reliquat: </strong>
                      {formatPrice(
                        selectedPaiement?.totalAmount -
                          selectedPaiement?.totalPaye
                      )}{' '}
                      F
                    </CardText>
                    <CardText>
                      <strong> Date:</strong>{' '}
                      {new Date(
                        selectedPaiement?.paiementDate
                      ).toLocaleDateString('fr-Fr', {
                        weekday: 'long',
                        year: 'numeric',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </CardText>
                    <CardText>
                      <strong>Méthode: </strong>
                      {capitalizeWords(selectedPaiement?.methode)}
                    </CardText>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReçuPaiement;
