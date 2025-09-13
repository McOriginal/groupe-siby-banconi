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
import { useCreateProduit, useUpdateProduit } from '../../Api/queriesProduits';

const ProduitForm = ({ produitToEdit, tog_form_modal }) => {
  // Matériels Query pour créer la Produit
  const { mutate: createProduit } = useCreateProduit();
  // Matériels Query pour Mettre à jour la Produit
  const { mutate: updateProduit } = useUpdateProduit();
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      name: produitToEdit?.name || '',
      price: produitToEdit?.price || undefined,
      stock: produitToEdit?.stock || undefined,
      imageUrl: produitToEdit?.imageUrl || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Ce champ est obligatoire'),
      stock: Yup.number()
        .positive('Le stock doit être un nombre positif')
        .required('Ce champ est obligatoire'),
      price: Yup.number().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      // Si la méthode est pour mise à jour alors
      const produitDataLoaded = {
        ...values,
      };

      if (produitToEdit) {
        updateProduit(
          { id: produitToEdit._id, data: produitDataLoaded },
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
        createProduit(values, {
          onSuccess: () => {
            successMessageAlert('Produit ajoutée avec succès');
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
            <Label htmlFor='name'>Nom du Produit</Label>
            <Input
              name='name'
              placeholder='Entrez le nom de produit'
              type='text'
              className='form-control border-1 border-dark'
              id='name'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.name || ''}
              invalid={
                validation.touched.name && validation.errors.name ? true : false
              }
            />
            {validation.touched.name && validation.errors.name ? (
              <FormFeedback type='invalid'>
                {validation.errors.name}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='stock'>Stock Disponible</Label>
            <Input
              name='stock'
              placeholder='Stock initial disponible'
              type='number'
              min={0}
              step={0.1}
              className='form-control border-1 border-dark'
              id='stock'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.stock || ''}
              invalid={
                validation.touched.stock && validation.errors.stock
                  ? true
                  : false
              }
            />
            {validation.touched.stock && validation.errors.stock ? (
              <FormFeedback type='invalid'>
                {validation.errors.stock}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='price'>Prix de Vente</Label>
            <Input
              name='price'
              placeholder='Entrez les prix de produit'
              type='number'
              className='form-control border-1 border-dark'
              id='price'
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
      </Row>

      <Row>
        <Col md='12'>
          <FormGroup className='mb-3'>
            <Label htmlFor='imageUrl'>
              Image de Couverture{' '}
              <span className='font-size-11 text-secondary'>(facultative)</span>{' '}
            </Label>
            <Input
              name='imageUrl'
              placeholder='Veillez copiez une image en ligne.....'
              type='text'
              className='form-control border-1 border-dark'
              id='imageUrl'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.imageUrl || ''}
              invalid={
                validation.touched.imageUrl && validation.errors.imageUrl
                  ? true
                  : false
              }
            />
            <a
              href={`https://www.google.com/search?sca_esv=36ac96dba69ebed1&sxsrf=AE3TifPFX9Ag6g7OHGRvbMuvmwEvx86_AA:1748385419157&q=${
                validation.values.name || 'produit quincaillerie'
              }&udm=2&fbs=AIIjpHx4nJjfGojPVHhEACUHPiMQ_pbg5bWizQs3A_kIenjtcpTTqBUdyVgzq0c3_k8z34GAwf0jHaPgz38H1UrFi4JZ_wsbaZy5bcislJwEjK9aKAAgw7EDHBpnhJERxbAHVFJEPpsPJRN2Lf5NIxh4Y6E23jLfuJM1k2vNHWwZgjeinct1k1SwMNRPIUfhAwFDaWeIbf0gNPayotFQo8sw3bnjAaBRZQ&sa=X&ved=2ahUKEwj6otue28SNAxWJKvsDHURDCkcQtKgLegQIFRAB&biw=1280&bih=585&dpr=1.5`}
              target='blank'
              style={{
                color: 'blue',
                textAlign: 'center',
                display: 'block',
                margin: '10px 0',
                textDecoration: 'underline #0000ff',
              }}
            >
              cliquer ici pour rechercher une image en ligne
            </a>
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

export default ProduitForm;
