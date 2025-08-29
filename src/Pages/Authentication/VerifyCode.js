import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  Container,
  FormFeedback,
  Input,
  Label,
  Form,
} from 'reactstrap';

import { Link, useNavigate } from 'react-router-dom';

// Formik Validation
import * as Yup from 'yup';
import { useFormik } from 'formik';

// action

// import images
import { companyLogo } from '../CompanyInfo/CompanyInfo';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';

const VerifyCode = () => {
  document.title = 'Vérification de code | MARHABA Santé';
  const [isLoading, setIsLoading] = useState(false);

  // State de navigation
  const navigate = useNavigate();

  // Formik
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      code: undefined,
    },
    validationSchema: Yup.object({
      code: Yup.number().required('Veiullez entrez le code de vérification'),
    }),
    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);
      setIsLoading(false);
      const verifyCode = JSON.parse(localStorage.getItem('verifyCode'));
      const userCode = verifyCode?.code;
      const expireCode = verifyCode?.expires;
      // Vérification du code
      if (!verifyCode) {
        setIsLoading(false);
        errorMessageAlert(
          'Aucun code de vérification trouvé. Veuillez réessayer.'
        );
        return;
      }

      // Vérification si le code existe
      if (userCode !== values.code) {
        setIsLoading(false);
        errorMessageAlert(
          'Code de vérification incorrect. Veuillez réessayer.'
        );
        return;
      }

      // Vérification si le code n'a pas expiré
      if (new Date() > new Date(expireCode)) {
        setIsLoading(false);
        errorMessageAlert('Le code expiré. Veuillez réessayer.');
        return navigate('/forgotPassword');
      }

      // Vérification si le code est correcte
      if (userCode === values.code) {
        setIsLoading(false);
        successMessageAlert(
          'Code de vérification correct. Vous pouvez maintenant réinitialiser votre mot de passe.'
        );
        resetForm();
        return navigate('/resetPassword');
      }
    },
    onError: (error) => {
      setIsLoading(false);
      errorMessageAlert(
        error?.response?.data?.message ||
          'Une erreur est survenue veuillez réessayer '
      );
    },
  });

  return (
    <React.Fragment>
      <div className='account-pages my-5 pt-sm-5'>
        <Container>
          <Row className='justify-content-center'>
            <Col md={8} lg={6} xl={5}>
              <Card className='overflow-hidden'>
                <div className='d-flex justify-content-center align-items-center'>
                  <img
                    src={companyLogo}
                    style={{
                      height: '100px',
                      objectFit: 'containt',
                    }}
                    alt=''
                    className='img-fluid'
                  />
                </div>
                <CardBody className='pt-0'>
                  <div className='p-2'>
                    <p className='text-muted mb-4 text-center'>
                      Le code de vérification vous a été envoyé par Email, si
                      vous n'avez pas réçu le code veuillez retourner pour
                      reprendre l'opération
                    </p>
                    <Form
                      className='form-horizontal'
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className='mb-3'>
                        <Label className='form-label'>
                          Code de Vérification
                        </Label>
                        <Input
                          name='code'
                          className='form-control font-size-20'
                          placeholder='Enter le code de vérification'
                          type='number'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.code || ''}
                          invalid={
                            validation.touched.code && validation.errors.code
                              ? true
                              : false
                          }
                        />
                        {validation.touched.code && validation.errors.code ? (
                          <FormFeedback type='invalid'>
                            <div>{validation.errors.code}</div>
                          </FormFeedback>
                        ) : null}
                      </div>
                      <div className='text-center'>
                        {isLoading ? (
                          <LoadingSpiner />
                        ) : (
                          <button
                            className='btn btn-primary w-md '
                            type='submit'
                          >
                            Vérifier le code
                          </button>
                        )}
                      </div>
                    </Form>
                  </div>
                  <div className='mt-5 text-center'>
                    <p className='text-secondary'>
                      © {new Date().getFullYear()} Santé MARHABA |{' '}
                      <i className='mdi mdi-heart text-danger'></i> Créé Par{' '}
                      <Link to={'https://www.cissemohamed.com'} target='blank'>
                        Cisse Mohamed
                      </Link>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default VerifyCode;
