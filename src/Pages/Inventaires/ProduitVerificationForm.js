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
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import { useGetAllUsers } from '../../Api/queriesAuth';
import { useCreateInventaire } from '../../Api/queriesInventaire';
import { capitalizeWords } from '../components/capitalizeFunction';

const ProduitVerificationForm = ({ selectedProduct, tog_form_modal }) => {
  const {
    data: userListe,
    isLoading: loadingUser,
    error: userDataError,
  } = useGetAllUsers();

  const { mutate: createInventaire } = useCreateInventaire();
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      produit: selectedProduct?._id,
      totalAmount: undefined,
      inventaireDate: new Date()?.toISOString().substring(0, 10) || undefined,
      quantity: undefined,
      boutiquer: undefined,
    },
    validationSchema: Yup.object({
      produit: Yup.string().required('Ce champ est obligatoire'),
      totalAmount: Yup.number()
        .positive('Le stock doit être un nombre positif')
        .required('Ce champ est obligatoire'),
      quantity: Yup.number()
        .positive('Ce champ doit être une valeur positif')
        .required('Ce champ est obligatoire'),
      inventaireDate: Yup.date().required('Ce champ est obligatoire'),
      boutiquer: Yup.string().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      createInventaire(
        { produit: selectedProduct?._id, ...values },
        {
          onSuccess: () => {
            successMessageAlert('Ajoutée avec succès');
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
          {loadingUser && <LoadingSpiner />}
          {userDataError && (
            <div className='fw-bold text-danger text-center'></div>
          )}
          {!userDataError && !loadingUser && (
            <FormGroup>
              <Label htmlFor='boutiquer'>Responsable</Label>
              <Input
                type='select'
                name='boutiquer'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.boutiquer || ''}
                invalid={
                  validation.touched.boutiquer && validation.errors.boutiquer
                    ? true
                    : false
                }
              >
                <option value=''>Sélectionner le Responsable</option>

                {userListe?.length > 0 &&
                  userListe.map((item) => (
                    <option key={item._id} value={item._id}>
                      {capitalizeWords(item.name)}
                      {' | '}
                      {item.email}
                    </option>
                  ))}
              </Input>
              {validation.touched.boutiquer && validation.errors.boutiquer ? (
                <FormFeedback type='invalid'>
                  {validation.errors.boutiquer}
                </FormFeedback>
              ) : null}
            </FormGroup>
          )}
        </Col>
      </Row>

      <Row>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='quantity'>Quantité Manquante</Label>
            <Input
              name='quantity'
              placeholder='Quantité manquante au Stock'
              type='number'
              min={1}
              step={0.1}
              className='form-control border-1 border-dark'
              id='quantity'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.quantity || ''}
              invalid={
                validation.touched.quantity && validation.errors.quantity
                  ? true
                  : false
              }
            />
            {validation.touched.quantity && validation.errors.quantity ? (
              <FormFeedback type='invalid'>
                {validation.errors.quantity}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>

        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='totalAmount'>Somme Total</Label>
            <Input
              name='totalAmount'
              placeholder="Entrez les prix d'achat de produit"
              type='number'
              className='form-control border-1 border-dark'
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
            <Label htmlFor='inventaireDate'>Date</Label>
            <Input
              name='inventaireDate'
              type='date'
              max={new Date().toISOString().split('T')[0]}
              className='form-control border-1 border-dark'
              id='inventaireDate'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.inventaireDate || ''}
              invalid={
                validation.touched.inventaireDate &&
                validation.errors.inventaireDate
                  ? true
                  : false
              }
            />

            {validation.touched.inventaireDate &&
            validation.errors.inventaireDate ? (
              <FormFeedback type='invalid'>
                {validation.errors.inventaireDate}
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

export default ProduitVerificationForm;
