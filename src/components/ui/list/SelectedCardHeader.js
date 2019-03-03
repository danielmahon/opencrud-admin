import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Transition, animated } from 'react-spring/renderprops';
import { capitalize } from 'lodash';
import styled from 'styled-components';
import { Typography } from '@rmwc/typography';

import ListDeleteButton from './ListDeleteButton';

const CardHeader = styled('div')`
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.rmwc.primaryLight};
  width: 100%;
  border-radius: 0.25rem 0.25rem 0 0;
`;
const CardHeaderTitle = styled(Typography).attrs({
  tag: 'div',
})`
  flex: 1;
  line-height: 3rem;
`;
const CardHeaderButtons = styled('div')`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

export default class SelectedCardHeader extends PureComponent {
  static propTypes = {
    selected: PropTypes.array,
    resourceParam: PropTypes.string,
    refetch: PropTypes.func,
  };

  render() {
    const { selected, refetch, resourceParam, resetSelection } = this.props;
    return (
      <Transition
        native
        items={selected.length > 0}
        from={{
          transform: 'translateY(-100%)',
          position: 'absolute',
          width: 'calc(100% - 3rem)',
        }}
        enter={{ transform: 'translateY(0)' }}
        leave={{ transform: 'translateY(-100%)' }}>
        {show =>
          show &&
          (props => (
            <animated.div style={props}>
              <CardHeader>
                <CardHeaderTitle use="body1">
                  {`${selected.length} ${capitalize(resourceParam)} selected`}
                </CardHeaderTitle>
                <CardHeaderButtons>
                  <ListDeleteButton
                    refetch={refetch}
                    selected={selected}
                    resetSelection={resetSelection}
                    resourceParam={resourceParam}
                  />
                </CardHeaderButtons>
              </CardHeader>
            </animated.div>
          ))
        }
      </Transition>
    );
  }
}
