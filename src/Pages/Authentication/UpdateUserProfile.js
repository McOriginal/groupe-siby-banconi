import React, { useState } from 'react';
import { Row, Col, Input, Label, Form, FormFeedback } from 'reactstrap';

// Formik Validation
import * as Yup from 'yup';
import { useFormik } from 'formik';

// import images
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import { useUpdateUser } from '../../Api/queriesAuth';

export default function UpdateUserProfile({ selectedUser, tog_form_modal }) {
  //   RegisterQuery
  const { mutate: updateUser } = useUpdateUser();
  // State pour gérer le chargement
  const [isLoading, setIsLoading] = useState(false);

  //   Validation Formik
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: selectedUser?.email || '',
      name: selectedUser?.name || '',
      role: selectedUser?.role || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Veuillez Entrer Votre Nom'),
      role: Yup.string().required('Veuillez Sélectionner un Rôle'),
      email: Yup.string().required('Veuillez Enterz une Adresse Email'),
    }),
    onSubmit: (values) => {
      setIsLoading(true);

      const userDataLoaded = {
        ...values,
      };
      // Créer un nouvel utilisateur
      updateUser(
        { id: selectedUser._id, data: userDataLoaded },
        {
          onSuccess: () => {
            setIsLoading(false);
            // Afficher une alerte de succès ou rediriger vers la page de connexion
            successMessageAlert('Modification Enregistré avec succès.');
            // Redirection vers la page de connexion après 3 secondes
            // Utiliser setTimeout pour la redirection
            tog_form_modal();
          },
          onError: (error) => {
            setIsLoading(false);
            // Afficher une alerte ou gérer l'erreur
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              error ||
              "Une erreur est survenue lors de l'inscription.";
            errorMessageAlert(errorMessage);
          },
        }
      );
    },
  });

  return (
    <Form
      className='form-horizontal'
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit();
        return false;
      }}
    >
      <Row>
        <Col md={12}>
          <div className='mb-4'>
            <Label className='form-label'>Nom d'Utilisateur</Label>
            <Input
              className='form-control border border-1 border-dark'
              name='name'
              type='text'
              placeholder='Enter name'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.name || ''}
              invalid={
                validation.touched.name && validation.errors.name ? true : false
              }
            />
            {validation.touched.name && validation.errors.name ? (
              <FormFeedback type='invalid'>
                <div>{validation.errors.name}</div>
              </FormFeedback>
            ) : null}
          </div>
          <div className='mb-4'>
            <Label className='form-label'>Rôle d'Utilisateur</Label>
            <Input
              className='form-control border border-1 border-dark'
              name='role'
              type='select'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.role || ''}
              invalid={
                validation.touched.role && validation.errors.role ? true : false
              }
            >
              <option value=''>Sélectionner un rôle</option>
              <option value='admin'>Administrateur</option>
              <option value='user'>Utilisateur</option>
            </Input>
            {validation.touched.role && validation.errors.role ? (
              <FormFeedback type='invalid'>
                <div>{validation.errors.role}</div>
              </FormFeedback>
            ) : null}
          </div>
          <div className='mb-4'>
            <Label className='form-label'>Email</Label>
            <Input
              className='form-control border border-1 border-dark'
              id='email'
              name='email'
              placeholder='Enter email'
              type='email'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.email || ''}
              invalid={
                validation.touched.email && validation.errors.email
                  ? true
                  : false
              }
            />
            {validation.touched.email && validation.errors.email ? (
              <FormFeedback type='invalid'>
                <div>{validation.errors.email}</div>
              </FormFeedback>
            ) : null}
          </div>

          <div className='d-grid mt-4'>
            {isLoading ? (
              <LoadingSpiner />
            ) : (
              <button
                className='btn btn-primary waves-effect waves-light'
                type='submit'
              >
                Enregistrer
              </button>
            )}
          </div>
        </Col>
      </Row>
    </Form>
  );
}
