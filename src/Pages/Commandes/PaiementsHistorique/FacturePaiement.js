import { Button, Card, CardBody, CardText, Modal } from 'reactstrap';
import {
  capitalizeWords,
  formatPrice,
} from '../../components/capitalizeFunction';
import html2pdf from 'html2pdf.js';
import { useOnePaiementHistorique } from '../../../Api/queriesPaiementHistorique';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import FactureHeader from '../Details/FactureHeader';

const FacturePaiement = ({
  show_modal,
  tog_show_modal,
  selectedPaiementHistoriqueID,
  reliqua,
}) => {
  const {
    data: selectedPaiementHistorique,
    error,
    isLoading,
  } = useOnePaiementHistorique(selectedPaiementHistoriqueID);
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // ------------------------------------------
  // ------------------------------------------
  // Export En PDF
  // ------------------------------------------
  // ------------------------------------------
  const exportPaiementToPDF = () => {
    const element = document.getElementById('paiementHistorique');
    const opt = {
      filename: 'paiementHistorique.pdf',
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
      <div className='modal-body' ref={contentRef} id='paiementHistorique'>
        {!error && !isLoading && (
          <div className='mx-5 d-flex justify-content-center'>
            <Card
              style={{
                boxShadow: '0px 0px 10px rgba(100, 169, 238, 0.5)',
                borderRadius: '15px',
                width: '583px',
                margin: '10px auto',
                position: 'relative',
              }}
            >
              <CardBody>
                <FactureHeader />

                {selectedPaiementHistorique?.commande?.statut === 'livré' &&
                  reliqua === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '20px',
                        transform: 'rotate(-45deg)',
                        opacity: '0.5',
                        border: '1px dashed #003f9f',
                        color: ' #003f9f',
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
                <div
                  sm='12'
                  className='d-flex justify-content-around align-items-center mt-4 px-2 '
                >
                  <div>
                    <CardText>
                      <strong> Nom et Prénom:</strong>{' '}
                      {capitalizeWords(
                        selectedPaiementHistorique?.commande?.fullName
                      )}
                    </CardText>
                    <CardText>
                      <strong> Adresse:</strong>{' '}
                      {capitalizeWords(
                        selectedPaiementHistorique?.commande?.adresse
                      )}
                    </CardText>
                  </div>
                  <div
                    className='border border-1 border-dark'
                    style={{ width: '2px', height: '100px' }}
                  ></div>

                  <div className='my-3'>
                    <CardText>
                      <strong> Payé: </strong>
                      {formatPrice(selectedPaiementHistorique?.amount)} F
                    </CardText>
                    <CardText>
                      <strong> Reliquat: </strong>
                      {formatPrice(reliqua)} F
                    </CardText>
                    <CardText>
                      <strong> Date:</strong>{' '}
                      {new Date(
                        selectedPaiementHistorique?.paiementDate
                      ).toLocaleDateString('fr-Fr', {
                        weekday: 'long',
                        year: 'numeric',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </CardText>
                    <CardText>
                      <strong>Méthode: </strong>
                      {capitalizeWords(selectedPaiementHistorique?.methode)}
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

export default FacturePaiement;
