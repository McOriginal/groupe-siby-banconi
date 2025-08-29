import {
  Button,
  Card,
  CardText,
  CardTitle,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import { useAllFournisseur } from '../../Api/queriesFournisseur';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { useCreateApprovisonnement } from '../../Api/queriesApprovisonnement';
import { useNavigate, useParams } from 'react-router-dom';
import { useOneProduit } from '../../Api/queriesProduits';

const ApprovisonnementForm = () => {
  const produitID = useParams();

  // Matériels Query pour créer la Medicament
  const { mutate: createApprovisonement } = useCreateApprovisonnement();

  // Afficher un seul PRODUIT pour recuperer son NOM
  const {
    data: selectedProduit,
    isLoading: loadingProduit,
    error,
  } = useOneProduit(produitID.id);

  // Fournisseur DATA
  const {
    data: fournisseurData,
    isLoading: fourniLoading,
    error: fourniError,
  } = useAllFournisseur();

  // State de chargement
  const [isLoading, setIsLoading] = useState(false);

  // State de Navigation
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate(-1);
  };

  // Form validation
  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      produit: produitID.id,
      quantity: undefined,
      price: undefined,
      deliveryDate: undefined,
      fournisseur: '',
    },

    validationSchema: Yup.object({
      quantity: Yup.number().required('Ce champ est obligatoire'),
      price: Yup.number().required('Ce champ est obligatoire'),
      deliveryDate: Yup.date().required('Ce champ est obligatoire'),
      fournisseur: Yup.string().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      if (!produitID.id) {
        setIsLoading(false);
        return errorMessageAlert('Produit non trouvré !');
      }

      createApprovisonement(
        { ...values, produit: produitID.id },
        {
          onSuccess: () => {
            successMessageAlert('Produit Approvisionné avec succès');
            setIsLoading(false);
            resetForm();
            handleNavigateBack();
          },
          onError: (err) => {
            console.log(err);
            const errorMessage =
              err?.response?.data?.message ||
              err?.message ||
              "Oh Oh ! Une erreur est survenue lors de l'enregistrement";
            errorMessageAlert(errorMessage);
            setIsLoading(false);
          },
        }
      ); // Sécurité : timeout pour stopper le chargement si blocage
      setTimeout(() => {
        if (isLoading) {
          errorMessageAlert('Une erreur est survenue. Veuillez réessayer !');
          setIsLoading(false);
        }
      }, 10000);
    },
  });

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          {/* Bouton Retour */}
          <Button
            color='warning'
            onClick={() => {
              navigate(-1);
            }}
          >
            <i className=' fas fa-angle-double-left me-2'></i>
            Retour
          </Button>
          {/* FIN Bouton Retour */}
          <div
            style={{
              margin: '20px auto',
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <Card
              style={{
                padding: '20px',
              }}
            >
              {loadingProduit && <LoadingSpiner />}
              {error && (
                <div className='mx-auto text-center text-danger'>
                  {' '}
                  <p>Erreur d'affichage de produit !</p>{' '}
                </div>
              )}
              {!loadingProduit && !error && (
                <div className=' mb-4'>
                  <CardTitle className='text-center font-size-20 fw-bold'>
                    {capitalizeWords(selectedProduit?.name)}{' '}
                  </CardTitle>
                  <CardText className='text-warning text-center'>
                    Prix de vente: {formatPrice(selectedProduit?.price)} F
                  </CardText>
                </div>
              )}

              <Form
                className='needs-validation'
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                  return false;
                }}
              >
                <Row>
                  <Col sm='6'>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='price'>Prix Unitaire d'Achat</Label>
                      <Input
                        name='price'
                        placeholder='Entrez un prix'
                        type='number'
                        className='form-control'
                        id='price'
                        min={1}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.price || ''}
                        invalid={
                          validation.touched.price && validation.errors.price
                            ? true
                            : false
                        }
                      />
                      {validation.touched.price && validation.errors.price ? (
                        <FormFeedback type='invalid'>
                          {validation.errors.price}
                        </FormFeedback>
                      ) : null}
                    </FormGroup>
                  </Col>
                  <Col sm='6'>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='quantity'>Quantité</Label>
                      <Input
                        name='quantity'
                        placeholder='ex 10; 40; 0'
                        type='number'
                        className='form-control'
                        id='quantity'
                        min={1}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.quantity || ''}
                        invalid={
                          validation.touched.quantity &&
                          validation.errors.quantity
                            ? true
                            : false
                        }
                      />
                      {validation.touched.quantity &&
                      validation.errors.quantity ? (
                        <FormFeedback type='invalid'>
                          {validation.errors.quantity}
                        </FormFeedback>
                      ) : null}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md='12'>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='deliveryDate'>Date d'Arrivée</Label>
                      <Input
                        name='deliveryDate'
                        placeholder='Chambre dédié pour les opérations chirugical.....'
                        type='date'
                        className='form-control'
                        id='deliveryDate'
                        max={new Date().toISOString().split('T')[0]} // Limite à aujourd'hui
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.deliveryDate || ''}
                        invalid={
                          validation.touched.deliveryDate &&
                          validation.errors.deliveryDate
                            ? true
                            : false
                        }
                      />
                      {validation.touched.deliveryDate &&
                      validation.errors.deliveryDate ? (
                        <FormFeedback type='invalid'>
                          {validation.errors.deliveryDate}
                        </FormFeedback>
                      ) : null}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md='12'>
                    {fourniLoading && <LoadingSpiner />}
                    {fourniError && (
                      <div className='fw-bold text-danger text-center'></div>
                    )}
                    {!fourniError && !fourniLoading && (
                      <FormGroup>
                        <Label htmlFor='fournisseur'>Fournisseur</Label>
                        <Input
                          type='select'
                          name='fournisseur'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.fournisseur || ''}
                          invalid={
                            validation.touched.fournisseur &&
                            validation.errors.fournisseur
                              ? true
                              : false
                          }
                        >
                          <option value=''>Sélectionner un fournisseur</option>

                          {fournisseurData?.length > 0 &&
                            fournisseurData.map((four) => (
                              <option key={four._id} value={four._id}>
                                {capitalizeWords(four.firstName)}{' '}
                                {capitalizeWords(four.lastName)}{' '}
                                {formatPhoneNumber(four.phoneNumber)}
                              </option>
                            ))}
                        </Input>
                        {validation.touched.fournisseur &&
                        validation.errors.fournisseur ? (
                          <FormFeedback type='invalid'>
                            {validation.errors.fournisseur}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    )}
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
            </Card>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ApprovisonnementForm;
