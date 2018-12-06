import React, { Fragment } from 'react';
import { Router, Location } from '@reach/router';
import { Transition, animated } from 'react-spring';

import { MainLayout, AuthLayout } from '../components/layouts';
import Dashboard from '../components/screens/Dashboard';
import ResourceList from '../components/screens/ResourceList';
import ResourceEdit from '../components/screens/ResourceEdit';
import NotFound from '../components/screens/NotFound';
import Login from '../components/screens/Login';
import Logout from '../components/screens/Logout';
import { Subscribe, AuthContainer } from '../state';

const SlideTransitionRouter = ({ children }) => {
  return (
    <Subscribe to={[AuthContainer]}>
      {({ state: { isLoggingOut } }) => (
        <Location>
          {({ location }) => (
            <Transition
              native
              items={isLoggingOut ? false : location}
              keys={location => location.pathname}
              from={{
                opacity: 0,
                left: -200,
                position: 'absolute',
                width: '100%',
              }}
              enter={{ opacity: 1, left: 0 }}
              leave={{ opacity: 0, left: isLoggingOut ? 0 : 200 }}>
              {location =>
                location &&
                (props => (
                  <animated.div style={props}>
                    <Router location={location}>{children}</Router>
                  </animated.div>
                ))
              }
            </Transition>
          )}
        </Location>
      )}
    </Subscribe>
  );
};
const FadeRouter = ({ children }) => {
  return (
    <Location>
      {({ location }) => (
        <Transition
          native
          items={location}
          keys={location => location.pathname}
          from={{ opacity: 0 }}
          enter={{ opacity: 1 }}
          leave={{ opacity: 0 }}>
          {location => props => (
            <animated.div style={props}>
              <Router location={location}>{children}</Router>
            </animated.div>
          )}
        </Transition>
      )}
    </Location>
  );
};

const RouteProvider = () => {
  return (
    <Fragment>
      <MainLayout>
        <SlideTransitionRouter>
          <Dashboard path="/" />
          <ResourceList path="/list/:resource" />
          <ResourceEdit path="/edit/:resource/:id" />
          <Logout path="/logout" />
          <NotFound default />
        </SlideTransitionRouter>
      </MainLayout>
      <AuthLayout>
        <FadeRouter>
          <Login path="/login" />
        </FadeRouter>
      </AuthLayout>
    </Fragment>
  );
};

export default RouteProvider;
