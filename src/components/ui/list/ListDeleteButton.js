import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import { upperFirst } from 'lodash';
import styled from 'styled-components';
import { Button, ButtonIcon } from '@rmwc/button';

import { remote } from '../../../graphs';

const StyledButton = styled(Button)`
  align-self: center;
`;

export default class ListDeleteButton extends Component {
  static propTypes = {
    resourceParam: PropTypes.string,
    refetch: PropTypes.func,
    selected: PropTypes.array,
  };
  render() {
    const { resourceParam, refetch, selected, resetSelection } = this.props;
    return (
      <Mutation
        mutation={remote.mutation[`deleteMany${upperFirst(resourceParam)}`]}
        onError={error => {
          resetSelection();
          window.alert(error);
        }}
        onCompleted={() => {
          resetSelection();
          refetch();
        }}
        variables={{
          where: { id_in: selected },
        }}>
        {handleDelete => (
          <StyledButton type="button" onClick={handleDelete}>
            <ButtonIcon icon="delete" />
            Delete
          </StyledButton>
        )}
      </Mutation>
    );
  }
}
