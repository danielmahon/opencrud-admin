import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogButton,
} from '@rmwc/dialog';
import { Icon } from '@rmwc/icon';
import Imgix from 'react-imgix';

const PreviewDialog = styled(Dialog)`
  z-index: 2000;
  .mdc-dialog__surface {
    max-width: calc(100vw - 4rem);
    img {
      max-width: 100%;
    }
  }
`;
const HoverOverlay = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.rmwc.overlay};
  opacity: 0;
  :hover {
    opacity: 1;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 200ms ease;
`;

export default class ListImageWidget extends PureComponent {
  static propTypes = {
    value: PropTypes.string,
  };
  state = { previewOpen: false };
  render() {
    const { previewOpen } = this.state;
    const { value } = this.props;
    return (
      <div
        style={{
          display: 'inline-block',
          position: 'relative',
          borderRadius: '0.25rem',
          overflow: 'hidden',
        }}>
        <Imgix
          src={value}
          width={128}
          height={128}
          htmlAttributes={{
            style: { verticalAlign: 'bottom' },
          }}
        />
        <HoverOverlay onClick={() => this.setState({ previewOpen: true })}>
          <Icon
            theme="textPrimaryOnDark"
            icon="zoom_in"
            style={{ fontSize: '3rem' }}
          />
        </HoverOverlay>
        <PreviewDialog
          open={previewOpen}
          onClose={() => this.setState({ previewOpen: false })}>
          <DialogContent>
            <Imgix src={value} sizes="90vw" />
          </DialogContent>
          <DialogActions>
            <DialogButton action="close" type="button">
              Close
            </DialogButton>
          </DialogActions>
        </PreviewDialog>
      </div>
    );
  }
}
