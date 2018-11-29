import React from 'react';
import { Router } from '@reach/router';

import Home from '../components/routes/Home';
import ResourceList from '../components/routes/ResourceList';
import ResourceEdit from '../components/routes/ResourceEdit';
import NotFound from '../components/routes/NotFound';

const RouteProvider = ({ children }) => {
  return (
    <Router>
      <Home path="/" />
      <ResourceList path="/list/:resource" />
      <ResourceEdit path="/edit/:resource/:id" />
      <NotFound default />
    </Router>
  );
};

export default RouteProvider;
