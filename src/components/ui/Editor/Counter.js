import React from 'react';
import { Chip } from '@rmwc/chip';
import styled from 'styled-components';

const StyledChip = styled(Chip)`
  margin-left: 0.5rem;
  pointer-events: none;
  opacity: ${props => (props['data-overlimit'] ? 1 : 0.5)};
  color: ${props =>
    props['data-overlimit'] ? props.theme.rmwc.onError : null};
  background-color: ${props =>
    props['data-overlimit'] ? props.theme.rmwc.error : null};
`;

export const Counter = ({ label, limit, editorState }) => {
  if (limit < 1) return null;
  const plainText = editorState.getCurrentContent().getPlainText('');
  const regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
  const cleanString = plainText.replace(regex, '').trim(); // replace above characters w/ nothing
  const charCount = cleanString.length;
  const overLimit = charCount > limit;
  return (
    <StyledChip
      data-overlimit={
        overLimit
      }>{`${charCount} of ${limit} ${label}`}</StyledChip>
  );
};
