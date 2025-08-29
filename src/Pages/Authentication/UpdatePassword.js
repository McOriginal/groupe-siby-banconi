import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  Label,
  Input,
  Button,
  FormFeedback,
  FormGroup,
} from 'reactstrap';
import {
  successMessageAlert,
  errorMessageAlert,
} from '../components/AlerteModal';
import { useUpdatePassword } from '../../Api/queriesAuth';
import { connectedUserId } from './userInfos';
import LoadingSpiner from '../components/LoadingSpiner';
import { AuthContext } from '../../Auth/AuthContext';

const UpdatePassword = () => {
  // Query to update password
  const { mutate: updatePassword } = useUpdatePassword();
  const { logout } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // handle show password toggle
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },

    validationSchema: Yup.object({
      oldPassword: Yup.string().required('Ancien mot de passe requis'),
      newPassword: Yup.string()
        .min(6, 'Minimum 6 caractères')
        .required('Nouveau mot de passe requis'),
      confirmPassword: Yup.string()
        .oneOf(
          [Yup.ref('newPassword'), null],
          'Les mots de passe doivent correspondre'
        )
        .required('Confirmation requise'),
    }),
    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);
      // Reset loading state after submission
      try {
        updatePassword(
          { id: connectedUserId, data: values },
          {
            onSuccess: () => {
              setIsLoading(false);
              successMessageAlert('Mot de passe modifié avec succès');
              resetForm();
              logout();
              // Redirect to login page after successful password change
            },
            onError: (error) => {
              errorMessageAlert(
                error.response?.data?.message ||
                  'Erreur de changement de mot de passe'
              );
              setIsLoading(false);
              // Optionally, reset the form if there's an error
            },
          }
        );
      } catch (error) {
        const msg = error?.response?.data?.message || 'Erreur de mise à jour';
        errorMessageAlert(msg);
      }
    },
  });

  return (
    <div className='page-content'>
      <Container fluid>
        <Row className='justify-content-center'>
          <Col md={6}>
            <Card>
              <CardBody>
                <h4 className='mb-4 text-center'>Changer mon mot de passe</h4>
                <Form
                  className='needs-validation'
                  onSubmit={(e) => {
                    e.preventDefault();
                    validation.handleSubmit();
                    return false;
                  }}
                >
                  <FormGroup>
                    <Label>Ancien mot de passe</Label>
                    <div className='d-flex gap-2 justify-content-center flex-nowrap  pb-3'>
                      <div className='w-100'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Entrez votre ancien mot de passe'
                          name='oldPassword'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.oldPassword}
                          invalid={
                            validation.touched.oldPassword &&
                            validation.errors.oldPassword
                              ? true
                              : false
                          }
                        />
                        {validation.touched.oldPassword &&
                        validation.errors.oldPassword ? (
                          <FormFeedback type='invalid'>
                            {validation.errors.oldPassword}
                          </FormFeedback>
                        ) : null}
                      </div>
                      {/* Password visible */}
                      <div className='show-details '>
                        <button
                          className='btn btn-sm btn-secondary show-item-btn'
                          type='button'
                          onClick={handleShowPassword}
                        >
                          {showPassword ? (
                            <i className='ri-eye-off-fill'></i>
                          ) : (
                            <i className='ri-eye-fill'></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <Label className='mt-3'>Nouveau mot de passe</Label>
                    <div className='d-flex gap-2 justify-content-center flex-nowrap  pb-3'>
                      <div className='w-100'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Entrez votre nouveau mot de passe'
                          name='newPassword'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.newPassword}
                          invalid={
                            validation.touched.newPassword &&
                            validation.errors.newPassword
                              ? true
                              : false
                          }
                        />
                        {validation.touched.newPassword &&
                        validation.errors.newPassword ? (
                          <FormFeedback type='invalid'>
                            {validation.errors.newPassword}
                          </FormFeedback>
                        ) : null}
                      </div>
                      {/* Password visible */}
                      <div className='show-details'>
                        <button
                          className='btn btn-sm btn-secondary show-item-btn'
                          type='button'
                          onClick={handleShowPassword}
                        >
                          {showPassword ? (
                            <i className='ri-eye-off-fill'></i>
                          ) : (
                            <i className='ri-eye-fill'></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label className='mt-3'>
                      Confirmer le nouveau mot de passe
                    </Label>
                    <div className='d-flex gap-2 justify-content-center flex-nowrap  pb-3'>
                      <div className='w-100'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Confirmer votre nouveau mot de passe'
                          name='confirmPassword'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.confirmPassword}
                          invalid={
                            validation.touched.confirmPassword &&
                            validation.errors.confirmPassword
                              ? true
                              : false
                          }
                        />
                        {validation.touched.confirmPassword &&
                        validation.errors.confirmPassword ? (
                          <FormFeedback type='invalid'>
                            {validation.errors.confirmPassword}
                          </FormFeedback>
                        ) : null}
                      </div>
                      {/* Password visible */}
                      <div className='show-details'>
                        <button
                          className='btn btn-sm btn-secondary show-item-btn'
                          type='button'
                          onClick={handleShowPassword}
                        >
                          {showPassword ? (
                            <i className='ri-eye-off-fill'></i>
                          ) : (
                            <i className='ri-eye-fill'></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </FormGroup>
                  <div className='text-center mt-4'>
                    {isLoading ? (
                      <LoadingSpiner />
                    ) : (
                      <Button color='primary' type='submit'>
                        Enregistrer
                      </Button>
                    )}
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UpdatePassword;
