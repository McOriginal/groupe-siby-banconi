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
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import { useCreateDepense, useUpdateDepense } from '../../Api/queriesDepense';
import { useState } from 'react';

const DepenseForm = ({ depenseToEdit, tog_form_modal }) => {
  // Depense Query pour créer la Depense
  const { mutate: createDepense } = useCreateDepense();
  // Depense Query pour Mettre à jour la Depense
  const { mutate: updateDepense } = useUpdateDepense();

  // State pour gérer le chargement
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      motifDepense: depenseToEdit?.motifDepense || '',
      totalAmount: depenseToEdit?.totalAmount || undefined,
      dateOfDepense: depenseToEdit?.dateOfDepense?.substring(0, 10) || '',
    },
    validationSchema: Yup.object({
      motifDepense: Yup.string().required('Ce champ est obligatoire'),
      totalAmount: Yup.number().required('Ce champ est obligatoire'),
      dateOfDepense: Yup.string().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      // Si la méthode est pour mise à jour alors
      const depenseDataLoaded = {
        ...values,
      };

      if (depenseToEdit) {
        updateDepense(
          { id: depenseToEdit._id, data: depenseDataLoaded },
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
        createDepense(values, {
          onSuccess: () => {
            successMessageAlert('Depense enregistrée avec succès');
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
        });
      }
      setTimeout(() => {
        if (isLoading) {
          errorMessageAlert('Une erreur est survenue. Veuillez réessayer !');
          setIsLoading(false);
        }
      }, 10000);
    },
  });
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
          <FormGroup className='mb-3'>
            <Label htmlFor='motifDepense'>Motif de Depense</Label>

            <Input
              name='motifDepense'
              placeholder='Quel est la raison de ce depense'
              type='text'
              className='form-control border-1 border-dark'
              border-1
              border-dark
              id='motifDepense'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.motifDepense || ''}
              invalid={
                validation.touched.motifDepense &&
                validation.errors.motifDepense
                  ? true
                  : false
              }
            />

            {validation.touched.motifDepense &&
            validation.errors.motifDepense ? (
              <FormFeedback type='invalid'>
                {validation.errors.motifDepense}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='12'>
          <FormGroup className='mb-3'>
            <Label htmlFor='totalAmount'>Somme Total</Label>

            <Input
              name='totalAmount'
              type='number'
              min={0}
              className='form-control border-1 border-dark'
              placeholder='Somme total dépensée'
              id='totalAmount'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.totalAmount || ''}
              invalid={
                validation.touched.totalAmount && validation.errors.totalAmount
                  ? true
                  : false
              }
            />
            {validation.touched.totalAmount && validation.errors.totalAmount ? (
              <FormFeedback type='invalid'>
                {validation.errors.totalAmount}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='12'>
          <FormGroup className='mb-3'>
            <Label htmlFor='dateOfDepense'>Date</Label>
            <Input
              name='dateOfDepense'
              type='date'
              max={new Date().toISOString().split('T')[0]}
              className='form-control border-1 border-dark'
              id='dateOfDepense'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.dateOfDepense || ''}
              invalid={
                validation.touched.dateOfDepense &&
                validation.errors.dateOfDepense
                  ? true
                  : false
              }
            />

            {validation.touched.dateOfDepense &&
            validation.errors.dateOfDepense ? (
              <FormFeedback type='invalid'>
                {validation.errors.dateOfDepense}
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

export default DepenseForm;
