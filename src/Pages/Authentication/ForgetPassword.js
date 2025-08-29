import PropTypes from 'prop-types';
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
import withRouter from '../../components/Common/withRouter';

// Formik Validation
import * as Yup from 'yup';
import { useFormik } from 'formik';

// action

// import images
import {
  companyLogo,
  companyName,
  companyOwnerName,
} from '../CompanyInfo/CompanyInfo';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import { useSendVerifyCodePasswordPassword } from '../../Api/queriesAuth';

const ForgetPasswordPage = () => {
  document.title = `Mot de passe oublié | ${companyName}`;

  // Qeury Reset Password
  const { mutate: sendVerifyCodePassword } =
    useSendVerifyCodePasswordPassword();
  const [isLoading, setIsLoading] = useState(false);

  // State de navigation
  const navigate = useNavigate();

  // Formmik
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Veiullez entrer votre email'),
    }),
    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);
      sendVerifyCodePassword(values, {
        onSuccess: (response) => {
          localStorage.setItem('verifyCode', JSON.stringify(response?.data));

          setIsLoading(false);
          resetForm();
          successMessageAlert('Un message a été envoyé à votre email');
          // Redirection vers la page de vérification de code
          navigate('/verifyCode');
        },
        onError: (error) => {
          setIsLoading(false);
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            'Une erreur est survenue';
          errorMessageAlert(errorMessage);
        },
      });
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
                      Vous allez recevoir un message par Email pour
                      réinitialiser le mot de passe
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
                        <Label className='form-label'>Email</Label>
                        <Input
                          name='email'
                          className='form-control'
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
                      <div className='text-center'>
                        {isLoading ? (
                          <LoadingSpiner />
                        ) : (
                          <button
                            className='btn btn-primary w-md '
                            type='submit'
                          >
                            Envoyer moi le message
                          </button>
                        )}
                      </div>
                    </Form>
                  </div>
                  <div className='mt-5 text-center'>
                    <p className='text-secondary'>
                      © {new Date().getFullYear()} {companyName}{' '}
                      {companyOwnerName} |{' '}
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

ForgetPasswordPage.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
