import { Button, Card, CardBody, CardText, CardTitle, Modal } from 'reactstrap';
import {
  capitalizeWords,
  formatPrice,
} from '../../components/capitalizeFunction';
import html2pdf from 'html2pdf.js';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import FactureHeader from '../Details/FactureHeader';

const FactureLivraison = ({
  show_modal,
  tog_show_modal,
  selectedLivraisonHistoriqueCommandes,
  delivredProducts,
  lastDelivreDate,
}) => {
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // ------------------------------------------
  // ------------------------------------------
  // Export En PDF
  // ------------------------------------------
  // ------------------------------------------
  const exportPaiementToPDF = () => {
    const element = document.getElementById('livraison');
    const opt = {
      filename: 'livraison.pdf',
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
      <div className='modal-body' ref={contentRef} id='livraison'>
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

              <div className='text-center my-4'>
                <CardText>
                  <strong> Dernière Livraison:</strong>{' '}
                  {new Date(lastDelivreDate?.livraisonDate).toLocaleDateString(
                    'fr-Fr',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      day: '2-digit',
                      month: '2-digit',
                    }
                  )}
                </CardText>
                <CardText>
                  <strong>Client :</strong>{' '}
                  {capitalizeWords(
                    selectedLivraisonHistoriqueCommandes?.fullName
                  )}
                </CardText>
              </div>
              <div
                className='border border-1 border-dark'
                style={{ width: '100%', height: '1px' }}
              ></div>
              <div className='text-center my-2'>
                <CardTitle>
                  {capitalizeWords('Situation des Articles :')}
                </CardTitle>
                <div className='my-3'>
                  {delivredProducts?.map((item) => (
                    <div key={item?.produit} className='text-center my-2'>
                      <p className='font-size-13'>
                        <strong className='text-muted'>
                          {capitalizeWords(item?.produit)}:{' '}
                        </strong>
                        <span className='text-success'>
                          {' '}
                          {formatPrice(item?.quantityLivree)}
                        </span>{' '}
                        Livré sur{' '}
                        <span className='text-warning'>
                          {' '}
                          {formatPrice(item?.quantityCommandee)}
                        </span>{' '}
                        Commandé
                        <span className='text-danger mx-3'>
                          Restant: {formatPrice(item?.quantityRestante)}
                        </span>{' '}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default FactureLivraison;
