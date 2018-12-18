import React, { PureComponent } from 'react';
import { Grid, GridInner, GridCell } from '@rmwc/grid';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';

import { DashboardCard } from '../ui/dashboard/DashboardCard';
import { remote } from '../../graphs';

class Dashboard extends PureComponent {
  render() {
    return (
      <Query query={remote.query.modelConfigsConnection}>
        {({ data: { modelConfigsConnection }, loading }) => {
          if (loading) return null;
          const models = modelConfigsConnection.edges.map(e => e.node);
          return (
            <Grid>
              <Helmet title="Mission Control" />
              <GridCell span={12}>
                <GridInner>
                  {models.map(model => {
                    return (
                      <GridCell span={4} key={model.type}>
                        <DashboardCard resource={model} />
                      </GridCell>
                    );
                  })}
                </GridInner>
              </GridCell>
            </Grid>
          );
        }}
      </Query>
    );
  }
}
export default Dashboard;
