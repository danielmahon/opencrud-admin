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
import Imgix, { buildURL } from 'react-imgix';

const PreviewDialog = styled(Dialog)`
  z-index: 2000;
  .mdc-dialog__content {
    padding: 0;
  }
  .mdc-dialog__surface {
    max-width: 90vw;
    overflow: hidden;
  }
  .mdc-dialog__scrim {
    background-color: ${({ theme }) => theme.rmwc.overlay};
  }
`;
const ImgWrapper = styled('div')`
  display: flex;
  position: relative;
  border-radius: 0.25rem;
  overflow: hidden;
`;
const LazyLoadImgix = styled(Imgix)`
  flex: 1;
  &.blur-up {
    transition: filter 300ms;
    filter: blur(4px);
    &.lazyloaded {
      filter: blur(0px);
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
    const lqip = buildURL(value, { w: 16, h: 16, auto: 'format' });
    return (
      <ImgWrapper>
        <LazyLoadImgix
          className="lazyload blur-up"
          src={value}
          width={128}
          height={128}
          htmlAttributes={{ src: lqip }}
          attributeConfig={{
            src: 'data-src',
            srcSet: 'data-srcset',
            sizes: 'data-sizes',
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
            <LazyLoadImgix
              className="lazyload"
              src={value}
              sizes="90vw"
              htmlAttributes={{
                style: { width: '90vw' },
                src: lqip,
              }}
              attributeConfig={{
                src: 'data-src',
                srcSet: 'data-srcset',
                sizes: 'data-sizes',
              }}
            />
          </DialogContent>
          <DialogActions>
            <DialogButton action="close" type="button">
              Close
            </DialogButton>
          </DialogActions>
        </PreviewDialog>
      </ImgWrapper>
    );
  }
}
