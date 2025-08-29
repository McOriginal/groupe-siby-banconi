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
import { useEffect, useState } from 'react';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  useCreatePaiement,
  useUpdatePaiement,
} from '../../Api/queriesPaiement';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { useAllCommandes } from '../../Api/queriesCommande';
import { useParams } from 'react-router-dom';

const PaiementForm = ({ paiementToEdit, tog_form_modal }) => {
  const commandeId = useParams();
  // Paiement Query pour créer la Paiement
  const { mutate: createPaiement } = useCreatePaiement();
  // Paiement Query pour Mettre à jour la Paiement
  const { mutate: updatePaiement } = useUpdatePaiement();

  // Query pour affiche toutes les commandeData
  const {
    data: commandeData,
    isLoading: isFetchingCommandes,
    error,
  } = useAllCommandes();

  // State pour gérer le chargement
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      commande:
        commandeId !== undefined && commandeId.id
          ? commandeId.id
          : paiementToEdit?.commande?._id || '',
      paiementDate: paiementToEdit?.paiementDate.substring(0, 10) || '',
      totalAmount: paiementToEdit?.totalAmount || undefined,
      reduction: paiementToEdit?.reduction || undefined,
      totalPaye: paiementToEdit?.totalPaye || undefined,
      methode: paiementToEdit?.methode || '',
    },
    validationSchema: Yup.object({
      commande: Yup.string().required('Ce champ est obligatoire'),
      paiementDate: Yup.date().required('Ce champ est obligatoire'),
      totalAmount: Yup.number().required('Ce champ est obligatoire'),
      reduction: Yup.number().typeError('Ce doit être un nombre valide'),
      totalPaye: Yup.number().required('Ce champ est obligatoire'),
      methode: Yup.string().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      // Si la méthode est pour mise à jour alors
      const paiementsDataLoaded = {
        ...values,
      };

      if (paiementToEdit) {
        updatePaiement(
          {
            id: paiementToEdit?._id,
            data: paiementsDataLoaded,
            totalAmount: paiementToEdit?.totalAmount,
          },
          {
            onSuccess: () => {
              successMessageAlert('Données mise à jour avec succès');
              setIsLoading(false);
              tog_form_modal();
            },
            onError: (err) => {
              errorMessageAlert(
                err?.response?.data?.message ||
                  err?.message ||
                  'Erreur lors de la mise à jour'
              );
              setIsLoading(false);
            },
          }
        );
      }

      // Sinon on créer un nouveau étudiant
      else {
        createPaiement(
          { ...values, totalAmount: validation.values.totalAmount },
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

  // Calcule de Somme Total en fonction de commande Sélectionné
  useEffect(() => {
    // La COMMANDE sélectionnée via _ID dans la liste deroulante
    const selectedCommande = commandeData?.commandesListe?.find(
      (t) => t._id === validation.values.commande
    );

    // Si il y'a une sélection alors
    if (selectedCommande) {
      // Calculer le montant total du commande
      const commandeAmount = selectedCommande?.totalAmount || 0;
      const reduction = Number(validation.values.reduction) || 0;
      const finalAmount = Math.max(commandeAmount - reduction, 0);

      // Si il n'y pas de reduction alors on affiche la somme exacte de TotalAmount de COMMANDE
      if (validation.values.totalAmount !== finalAmount) {
        validation.setFieldValue('totalAmount', finalAmount);
      }
    }
  }, [validation.values.commande, validation.values.reduction, commandeData]);

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
        <Col md='12'>
          {/* Affichage de la somme de TotalAmount de Commande */}
          {validation.values.totalAmount !== undefined && (
            <p className='text-end'>
              Total Facture:{' '}
              <span className='text-warning'>
                {validation.values.totalAmount !== undefined
                  ? formatPrice(validation.values.totalAmount)
                  : 0}{' '}
                F{' '}
              </span>
            </p>
          )}
          {!error && isFetchingCommandes && <LoadingSpiner />}
          {error && (
            <p className='text-getRectCenter text-danger'>
              Erreur de chargement veillez acctualiser la page{' '}
            </p>
          )}
          {!error && !isFetchingCommandes && !commandeId.id && (
            <FormGroup className='mb-3'>
              <Label htmlFor='commande'>Commande</Label>

              <Input
                name='commande'
                type='select'
                className='form-control border-1 border-dark'
                id='commande'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.commande || ''}
                invalid={
                  validation.touched.commande && validation.errors.commande
                    ? true
                    : false
                }
              >
                <option value=''>Sélectionner une Commande</option>
                {commandeData?.commandesListe?.map((com) => (
                  <option key={com._id} value={com._id}>
                    {capitalizeWords(com.fullName)} {' | '}
                    {capitalizeWords(com.adresse)}
                    {' | '} {formatPhoneNumber(com.phoneNumber)}
                  </option>
                ))}
              </Input>
              {validation.touched.commande && validation.errors.commande ? (
                <FormFeedback type='invalid'>
                  {validation.errors.commande}
                </FormFeedback>
              ) : null}
            </FormGroup>
          )}
        </Col>
      </Row>

      <Row>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='totalPaye'>Somme Payé</Label>

            <Input
              name='totalPaye'
              type='number'
              min={0}
              max={validation.values.totalAmount || 0}
              placeholder='Somme Payé'
              className='form-control no-spinner border-1 border-dark'
              id='totalPaye'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.totalPaye || ''}
              invalid={
                validation.touched.totalPaye && validation.errors.totalPaye
                  ? true
                  : false
              }
            />
            {validation.touched.totalPaye && validation.errors.totalPaye ? (
              <FormFeedback type='invalid'>
                {validation.errors.totalPaye}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='reduction'>Réduction</Label>

            <Input
              name='reduction'
              type='number'
              style={{ color: 'red' }}
              min={0}
              max={validation.values.totalAmount || 0}
              placeholder='Réduction appliquée'
              className='form-control border-1 border-dark'
              id='reduction'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.reduction || undefined}
              invalid={
                validation.touched.reduction && validation.errors.reduction
                  ? true
                  : false
              }
            />
            {validation.touched.reduction && validation.errors.reduction ? (
              <FormFeedback type='invalid'>
                {validation.errors.reduction}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='6'>
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
        <Col md='6'>
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

export default PaiementForm;
