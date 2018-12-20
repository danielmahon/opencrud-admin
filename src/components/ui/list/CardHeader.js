import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { navigate } from '@reach/router';
import { capitalize } from 'lodash';
import styled from 'styled-components';
import { Typography } from '@rmwc/typography';
import { IconButton } from '@rmwc/icon-button';

const CardHeader = styled('div')`
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  opacity: ${props => (props['data-hidden'] ? 0 : 1)};
  transition: opacity 200ms ease;
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
  };

  render() {
    const { selected, resourceParam } = this.props;
    return (
      <CardHeader data-hidden={selected.length > 0}>
        <CardHeaderTitle use="headline6">
          {capitalize(resourceParam)}
        </CardHeaderTitle>
        <CardHeaderButtons>
          <IconButton
            type="button"
            icon="settings"
            onClick={() => navigate(`/settings/${resourceParam}`)}
          />
        </CardHeaderButtons>
      </CardHeader>
    );
  }
}
