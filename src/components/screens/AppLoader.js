import React, { PureComponent } from 'react';
import { Grid, GridCell } from '@rmwc/grid';
import { CircularProgress } from '@rmwc/circular-progress';
import styled from 'styled-components';
import { Typography } from 'rmwc';

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

class AppLoader extends PureComponent {
  render() {
    const { message } = this.props;
    return (
      <TallGrid>
        <GridCell span={12} align="middle" style={{ textAlign: 'center' }}>
          <CircularProgress size="xlarge" />
          {message && (
            <Typography use="caption" tag="div">
              {message}
            </Typography>
          )}
        </GridCell>
      </TallGrid>
    );
  }
}
export default AppLoader;
