import React, { PureComponent } from 'react';
// import { Link } from '@reach/router';
import { Grid, GridCell } from '@rmwc/grid';
import { Helmet } from 'react-helmet';

import Text from '../ui/Text';

class Settings extends PureComponent {
  render() {
    return (
      <Grid>
        <Helmet title="Settings" />
        <GridCell span={12}>
          <Text>Settings [WIP]</Text>
        </GridCell>
      </Grid>
    );
  }
}
export default Settings;
