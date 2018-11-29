import React, { PureComponent } from 'react';
import { Link } from '@reach/router';
import { Grid, GridCell } from '@rmwc/grid';

import { DefaultLayout } from '../layouts';
import logo from '../../images/logo.svg';
import Text from '../ui/Text';

class Home extends PureComponent {
  state = { count: 0 };
  componentDidMount = () => {
    this.counter = setInterval(() => {
      this.setState({ count: this.state.count + 1 });
    }, 1000);
  };
  componentWillUnmount = () => {
    clearInterval(this.counter);
  };
  render() {
    return (
      <DefaultLayout title="Home">
        <Grid>
          <GridCell span={12}>
            <img src={logo} className="App-logo" alt="logo" />
            <Text>
              Edit <code>src/App.js</code> and save to reload.
            </Text>
            <Text>App: {this.state.count}</Text>
            <nav>
              <Link to="/">Home</Link> <Link to="dashboard">Dashboard</Link>
            </nav>
          </GridCell>
        </Grid>
      </DefaultLayout>
    );
  }
}
export default Home;
