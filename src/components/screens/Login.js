import React, { PureComponent } from 'react';
import { Grid, GridCell } from '@rmwc/grid';
import { Button } from '@rmwc/button';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Card, CardMedia, CardMediaContent } from '@rmwc/card';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { Formik, Form, Field } from 'formik';
import { Transition, animated } from 'react-spring/renderprops';
import { CircularProgress } from '@rmwc/circular-progress';
import { Mutation } from 'react-apollo';
import * as Yup from 'yup';
import { navigate } from '@reach/router';

import logo from '../../images/logo.svg';
import { Subscribe, AuthState } from '../../state';
import { remote } from '../../graphs';

const TallGrid = styled(Grid)`
  height: 100vh;
  .mdc-layout-grid__inner {
    height: 100%;
    /* align-items: center; */
    justify-items: center;
  }
  .mdc-text-field {
    width: 100%;
    &:not(.mdc-text-field--invalid) {
      /* margin-bottom: 1rem; */
    }
  }
  .mdc-text-field-helper-text {
    margin-bottom: 1rem;
  }
`;
const CardContent = styled.div`
  padding: 1rem;
`;
const ForgotPassword = styled.div`
  text-align: center;
  margin-top: 1rem;
`;

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Required'),
  password: Yup.string().required('Required'),
});

class Login extends PureComponent {
  render() {
    return (
      <Mutation mutation={remote.mutation.login}>
        {remoteLogin => (
          <Subscribe to={[AuthState]}>
            {({ handleLogin }) => {
              return (
                <TallGrid>
                  <Helmet title="Login" />
                  <GridCell span={12} align="middle">
                    <Transition
                      native
                      items={true}
                      from={{ marginTop: 200 }}
                      enter={{ marginTop: 0 }}
                      leave={{ marginTop: -200 }}>
                      {show =>
                        show &&
                        (props => (
                          <Card
                            style={{
                              ...props,
                              width: '24rem',
                              maxWidth: '100%',
                            }}
                            tag={animated.div}>
                            <CardMedia
                              sixteenByNine
                              style={{
                                backgroundImage:
                                  'url(https://material-components-web.appspot.com/images/16-9.jpg)',
                              }}>
                              <CardMediaContent style={{ textAlign: 'center' }}>
                                <img
                                  src={logo}
                                  style={{ height: '100%' }}
                                  alt="logo"
                                />
                              </CardMediaContent>
                            </CardMedia>
                            <CardContent>
                              <Formik
                                initialValues={{ email: '', password: '' }}
                                validationSchema={LoginSchema}
                                onSubmit={async (
                                  values,
                                  { setSubmitting, setFieldError }
                                ) => {
                                  try {
                                    const { data } = await remoteLogin({
                                      variables: values,
                                    });
                                    await handleLogin({
                                      token: data.login.token,
                                      user: data.login.user,
                                    });
                                    setSubmitting(false);
                                    navigate('/');
                                  } catch ({ graphQLErrors }) {
                                    setSubmitting(false);
                                    graphQLErrors.forEach(error => {
                                      setFieldError(
                                        error.data.field,
                                        error.message
                                      );
                                    });
                                  }
                                }}>
                                {({
                                  isSubmitting,
                                  isValid,
                                  errors,
                                  touched,
                                }) => (
                                  <Form>
                                    <Field
                                      name="email"
                                      render={({ field }) => {
                                        return (
                                          <TextField
                                            {...field}
                                            outlined
                                            required
                                            type="email"
                                            invalid={
                                              errors.email && touched.email
                                            }
                                            label="Email"
                                          />
                                        );
                                      }}
                                    />
                                    <TextFieldHelperText
                                      theme="error"
                                      persistent
                                      validationMsg>
                                      {touched.email && errors.email}
                                    </TextFieldHelperText>
                                    <Field
                                      name="password"
                                      render={({ field }) => (
                                        <TextField
                                          {...field}
                                          outlined
                                          required
                                          type="password"
                                          invalid={
                                            errors.password && touched.password
                                          }
                                          label="Password"
                                        />
                                      )}
                                      outlined
                                    />
                                    <TextFieldHelperText
                                      theme="error"
                                      persistent
                                      validationMsg>
                                      {touched.password && errors.password}
                                    </TextFieldHelperText>
                                    <Button
                                      unelevated
                                      disabled={!isValid || isSubmitting}
                                      type="submit"
                                      style={{ width: '100%' }}>
                                      {isSubmitting ? (
                                        <CircularProgress />
                                      ) : (
                                        'Login'
                                      )}
                                    </Button>
                                  </Form>
                                )}
                              </Formik>
                            </CardContent>
                          </Card>
                        ))
                      }
                    </Transition>
                    <ForgotPassword>
                      <Button>Forgot your password?</Button>
                    </ForgotPassword>
                  </GridCell>
                </TallGrid>
              );
            }}
          </Subscribe>
        )}
      </Mutation>
    );
  }
}
export default Login;
