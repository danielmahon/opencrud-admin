import React, { PureComponent } from 'react';
// import { Link } from '@reach/router';
import { Grid, GridCell } from '@rmwc/grid';
import { Helmet } from 'react-helmet';

import Text from '../ui/Text';

class Dashboard extends PureComponent {
  render() {
    return (
      <Grid>
        <Helmet title="Mission Control" />
        <GridCell span={12}>
          <Text>Dashboard [WIP]</Text>
        </GridCell>
      </Grid>
    );
  }
}
export default Dashboard;