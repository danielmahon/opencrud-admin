import React, { PureComponent } from 'react';
import { navigate } from '@reach/router';
import { Grid, GridCell } from '@rmwc/grid';

import { DefaultLayout } from '../layouts';
import Text from '../ui/Text';

class NotFound extends PureComponent {
  state = { count: 5 };
  componentDidMount = () => {
    this.counter = setInterval(() => {
      if (this.state.count === 0) {
        return navigate('/');
      }
      this.setState({ count: this.state.count - 1 });
    }, 1000);
  };
  componentWillUnmount = () => {
    clearInterval(this.counter);
  };
  render() {
    const { count } = this.state;
    return (
      <Grid>
        <GridCell span={12}>
          <Text use="headline2">404 Not Found</Text>
          <Text>Returning home in {count}...</Text>
        </GridCell>
      </Grid>
    );
  }
}
export default NotFound;
