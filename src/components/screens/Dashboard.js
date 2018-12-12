import React, { PureComponent } from 'react';
import { Grid, GridInner, GridCell } from '@rmwc/grid';
import { Helmet } from 'react-helmet';

import { SettingsState, Subscribe } from '../../state';
import { DashboardCard } from '../ui/dashboard/DashboardCard';

class Dashboard extends PureComponent {
  render() {
    return (
      <Subscribe to={[SettingsState]}>
        {({ state: { resources } }) => (
          <Grid>
            <Helmet title="Mission Control" />
            <GridCell span={12}>
              <GridInner>
                {resources.map(resource => {
                  return (
                    <GridCell span={4} key={resource.type}>
                      <DashboardCard resource={resource} />
                    </GridCell>
                  );
                })}
              </GridInner>
            </GridCell>
          </Grid>
        )}
      </Subscribe>
    );
  }
}
export default Dashboard;
