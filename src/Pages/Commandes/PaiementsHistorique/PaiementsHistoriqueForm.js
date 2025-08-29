import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState } from 'react';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../../components/AlerteModal';
import LoadingSpiner from '../../components/LoadingSpiner';
import { useOneCommande } from '../../../Api/queriesCommande';
import {
  useCreatePaiementHistorique,
  useUpdatePaiementHistorique,
} from '../../../Api/queriesPaiementHistorique';
import { useParams } from 'react-router-dom';

const PaiementsHistoriqueForm = ({
  selectedPaiementHistoriqueToUpdate,
  tog_form_modal,
}) => {
  // Récuperation de ID dans URL en utilisant UsParams
  const selectedCommande = useParams();

  // Paiement Query pour créer la Paiement
  const { mutate: createPaiementHistorique } = useCreatePaiementHistorique();

  // Query Update Paiament Historique
  const { mutate: updatePaiementHistorique } = useUpdatePaiementHistorique();
  // Query pour affiche toutes les selectedCommandeData
  const { data: selectedCommandeData } = useOneCommande(selectedCommande.id);

  // State pour gérer le chargement
  const [isLoading, setIsLoading] = useState(false);
  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      commande: selectedCommande.id,
      paiementDate:
        selectedPaiementHistoriqueToUpdate?.paiementDate?.substring(0, 10) ||
        undefined,
      amount: selectedPaiementHistoriqueToUpdate?.amount || undefined,
      methode: selectedPaiementHistoriqueToUpdate?.methode || '',
    },
    validationSchema: Yup.object({
      paiementDate: Yup.date().required('Ce champ est obligatoire'),
      amount: Yup.number().required('Ce champ est obligatoire'),
      methode: Yup.string().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      const selectedPaiementHistoriqueToUpdateDataLoaded = {
        ...values,
      };
      if (selectedPaiementHistoriqueToUpdate) {
        updatePaiementHistorique(
          {
            id: selectedPaiementHistoriqueToUpdate?._id,
            data: selectedPaiementHistoriqueToUpdateDataLoaded,
          },
          {
            onSuccess: () => {
              successMessageAlert('Paiement mise à jour avec succès');
              setIsLoading(false);
              resetForm();
              tog_form_modal();
            },
            onError: (err) => {
              const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Oh Oh ! une erreur est survenu lors de l'enregistrement";
              errorMessageAlert(errorMessage);
              setIsLoading(false);
            },
          }
        );
      } else {
        // on ajoute le paiements dans l'historique
        createPaiementHistorique(
          { ...values, commande: selectedCommande.id },
          {
            onSuccess: () => {
              successMessageAlert('Paiement ajoutée avec succès');
              setIsLoading(false);
              resetForm();
              tog_form_modal();
            },
            onError: (err) => {
              const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Oh Oh ! une erreur est survenu lors de l'enregistrement";
              errorMessageAlert(errorMessage);
              setIsLoading(false);
            },
          }
        );
      }
      setTimeout(() => {
        if (isLoading) {
          errorMessageAlert('Une erreur est survenue. Veuillez réessayer !');
          setIsLoading(false);
        }
      }, 10000);
    },
  });

  // Affichage des champs de Formulaire
  return (
    <Form
      className='needs-validation'
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit();
        return false;
      }}
    >
      <Row>
        <Col sm={12}>
          <FormGroup className='mb-3'>
            <Label htmlFor='amount'>Somme Payé</Label>

            <Input
              name='amount'
              type='number'
              min={0}
              max={
                selectedCommandeData?.paiementCommande?.totalAmount -
                selectedCommandeData?.paiementCommande?.totalPaye
              }
              placeholder='Somme Payé'
              className='form-control no-spinner border-1 border-dark'
              id='amount'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.amount || ''}
              invalid={
                validation.touched.amount && validation.errors.amount
                  ? true
                  : false
              }
            />
            {validation.touched.amount && validation.errors.amount ? (
              <FormFeedback type='invalid'>
                {validation.errors.amount}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='12'>
          <FormGroup className='mb-3'>
            <Label htmlFor='paiementDate'>Date de Paiement</Label>

            <Input
              name='paiementDate'
              type='date'
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              className='form-control border-1 border-dark'
              id='paiementDate'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.paiementDate || ''}
              invalid={
                validation.touched.paiementDate &&
                validation.errors.paiementDate
                  ? true
                  : false
              }
            />
            {validation.touched.paiementDate &&
            validation.errors.paiementDate ? (
              <FormFeedback type='invalid'>
                {validation.errors.paiementDate}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <FormGroup className='mb-3'>
            <Label htmlFor='methode'>Méthode de Paiement</Label>
            <Input
              name='methode'
              type='select'
              className='form-control border-1 border-dark'
              id='methode'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.methode || ''}
              invalid={
                validation.touched.methode && validation.errors.methode
                  ? true
                  : false
              }
            >
              <option value=''>Sélectionner la méthode de paiement</option>
              <option value='cash'>En Espèce</option>
              <option value='orange money'>Orange Money</option>
              <option value='moove money'>Moove Money</option>
            </Input>
            {validation.touched.methode && validation.errors.methode ? (
              <FormFeedback type='invalid'>
                {validation.errors.methode}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>

      <div className='d-grid text-center mt-4'>
        {isLoading && <LoadingSpiner />}
        {!isLoading && (
          <Button color='success' type='submit'>
            Enregisrer
          </Button>
        )}
      </div>
    </Form>
  );
};

export default PaiementsHistoriqueForm;
