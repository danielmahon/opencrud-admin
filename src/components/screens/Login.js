import React, { PureComponent } from 'react';
import { Grid, GridCell } from '@rmwc/grid';
import { Button } from '@rmwc/button';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import {
  Card,
  CardPrimaryAction,
  CardMedia,
  CardAction,
  CardActions,
  CardActionButtons,
  CardActionIcons,
} from '@rmwc/card';
import { Typography } from '@rmwc/typography';
import { TextField, TextFieldIcon, TextFieldHelperText } from '@rmwc/textfield';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Transition, animated } from 'react-spring';

// import logo from '../../images/logo.svg';
import Text from '../ui/Text';
import { AuthConsumer } from '../../providers/AuthProvider';

const TallGrid = styled(Grid)`
  height: 100vh;
  .mdc-layout-grid__inner {
    height: 100%;
    /* align-items: center; */
    justify-items: center;
  }
  .mdc-text-field {
    width: 100%;
    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }
`;

class Login extends PureComponent {
  render() {
    return (
      <AuthConsumer>
        {({ login }) => {
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
                        style={{ ...props, maxWidth: '24rem' }}
                        tag={animated.div}>
                        <CardMedia
                          sixteenByNine
                          style={{
                            backgroundImage:
                              'url(https://material-components-web.appspot.com/images/16-9.jpg)',
                          }}
                        />
                        <div style={{ padding: '0 1rem 1rem 1rem' }}>
                          <Typography use="headline6" tag="h2">
                            Mission Control Login
                          </Typography>
                          <Formik
                            initialValues={{ email: '', password: '' }}
                            onSubmit={(values, { setSubmitting }) => {
                              console.log(values);
                              login(values);
                              // setSubmitting(false);
                            }}>
                            {() => (
                              <Form>
                                <Field
                                  name="email"
                                  render={({ field }) => (
                                    <TextField
                                      outlined
                                      type="email"
                                      label="Email"
                                      {...field}
                                    />
                                  )}
                                />
                                <Field
                                  name="password"
                                  render={({ field }) => (
                                    <TextField
                                      outlined
                                      type="password"
                                      label="Password"
                                      {...field}
                                    />
                                  )}
                                  outlined
                                />
                                <Button
                                  unelevated
                                  type="submit"
                                  style={{ width: '100%' }}>
                                  Login
                                </Button>
                              </Form>
                            )}
                          </Formik>
                        </div>
                      </Card>
                    ))
                  }
                </Transition>
              </GridCell>
            </TallGrid>
          );
        }}
      </AuthConsumer>
    );
  }
}
export default Login;
