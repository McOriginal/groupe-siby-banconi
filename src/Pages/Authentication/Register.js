import React, { useState } from 'react';
import {
  Row,
  Col,
  CardBody,
  Card,
  Container,
  Input,
  Label,
  Form,
  FormFeedback,
} from 'reactstrap';

// Formik Validation
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Link, useNavigate } from 'react-router-dom';

// import images
import { useRegister } from '../../Api/queriesAuth';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  companyLogo,
  companyName,
  companyOwnerName,
} from '../CompanyInfo/CompanyInfo';

const Register = () => {
  document.title = `Inscription | ${companyName} `;

  //   RegisterQuery
  const { mutate: registerUser } = useRegister();
  // State pour gérer le chargement
  const [isLoading, setIsLoading] = useState(false);

  //   Navigation State
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // handle show password toggle
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  //   Validation Formik
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: '',
      name: '',
      password: '',
      role: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Veuillez Entrer Votre Nom'),
      role: Yup.string().required('Veuillez Sélectionner un Rôle'),
      email: Yup.string().required('Veuillez Enterz une Adresse Email'),
      password: Yup.string().required('Veuillez Entrer Votre Mot de Passe'),
    }),
    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      // Créer un nouvel utilisateur
      registerUser(values, {
        onSuccess: () => {
          setIsLoading(false);
          // Afficher une alerte de succès ou rediriger vers la page de connexion
          successMessageAlert(
            'Inscription réussie ! Vous allez être redirigé vers la page de connexion.'
          );
          resetForm();
          // Redirection vers la page de connexion après 3 secondes
          // Utiliser setTimeout pour la redirection
          setTimeout(() => {
            navigate('/login');
          }, 3000);
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
      });
    },
  });

  return (
    <div className='bg-pattern'>
      <div className='bg-overlay'></div>
      <div className='account-pages pt-5'>
        <Container>
          <Row className='justify-content-center'>
            <Col lg={6} md={8} xl={4}>
              <Card className='mt-5'>
                <CardBody className='px-3'>
                  <div className='text-center mb-4'>
                    <img
                      src={companyLogo}
                      alt=''
                      height='120px'
                      width='100px'
                      style={{ objectFit: 'cover' }}
                      className='auth-logo logo-dark mx-auto'
                    />
                    <h2
                      className=' mt-1 text-center'
                      style={{ color: ' #00078e' }}
                    >
                      {companyName}
                    </h2>
                    <h6
                      style={{
                        color: ' #ffff',
                        background: ' #00078e',
                        padding: '5px',
                        borderRadius: '5px',
                      }}
                    >
                      {companyOwnerName}
                    </h6>
                  </div>

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
                          <Label className='form-label'>
                            Nom d'Utilisateur
                          </Label>
                          <Input
                            name='name'
                            type='text'
                            placeholder="Nom d'utilisateur"
                            className='border-1 border-dark'
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.name || ''}
                            invalid={
                              validation.touched.name && validation.errors.name
                                ? true
                                : false
                            }
                          />
                          {validation.touched.name && validation.errors.name ? (
                            <FormFeedback type='invalid'>
                              <div>{validation.errors.name}</div>
                            </FormFeedback>
                          ) : null}
                        </div>
                        <div className='mb-4'>
                          <Label className='form-label'>
                            Rôle d'Utilisateur
                          </Label>
                          <Input
                            name='role'
                            type='select'
                            className='form-control border-1 border-dark'
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.role || ''}
                            invalid={
                              validation.touched.role && validation.errors.role
                                ? true
                                : false
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
                            id='email'
                            name='email'
                            className='form-control border-1 border-dark'
                            placeholder='Adresse email'
                            type='email'
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.email || ''}
                            invalid={
                              validation.touched.email &&
                              validation.errors.email
                                ? true
                                : false
                            }
                          />
                          {validation.touched.email &&
                          validation.errors.email ? (
                            <FormFeedback type='invalid'>
                              <div>{validation.errors.email}</div>
                            </FormFeedback>
                          ) : null}
                        </div>

                        <div className='mb-4'>
                          <Label className='form-label'>Mot de passe</Label>
                          <div className='d-flex gap-2 justify-content-center flex-nowrap  pb-3'>
                            <div className=' w-100'>
                              <Input
                                name='password'
                                value={validation.values.password || ''}
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Mot de Passe minimum (6) caractère'
                                className='form-controle border-1 border-dark'
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.password &&
                                  validation.errors.password
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.password &&
                              validation.errors.password ? (
                                <FormFeedback type='invalid'>
                                  <div> {validation.errors.password} </div>
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
                        </div>

                        <div className='d-grid mt-4'>
                          {isLoading ? (
                            <LoadingSpiner />
                          ) : (
                            <button
                              className='btn btn-primary waves-effect waves-light'
                              type='submit'
                            >
                              Créer le Compte
                            </button>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
              <div className='mt-5 text-center'>
                <p className='text-white-50'>
                  © {new Date().getFullYear()} {companyName} {companyOwnerName}{' '}
                  | <i className='mdi mdi-heart text-danger'></i> Créé Par{' '}
                  <Link to={'https://www.cissemohamed.com'} target='blank'>
                    Cisse Mohamed
                  </Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Register;
