import React, { PureComponent } from 'react';
import styled from 'styled-components';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogButton,
} from '@rmwc/dialog';
import { Icon } from '@rmwc/icon';
import Imgix, { buildURL } from 'react-imgix';
import path from 'path';
import { isPlainObject } from 'lodash';
import ReactPlayer from 'react-player';

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
  position: relative;
  overflow: hidden;
  border-radius: 0.25rem;
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
  width: 128px;
  height: 100%;
  border-radius: 0.25rem;
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

const SUPPORTED_IMGIX_FORMATS = [
  'ai',
  'bmp',
  'gif',
  'heic',
  'ico',
  'icns',
  'jpg',
  'jpeg',
  'jpeg2000',
  'pct',
  'pdf',
  'pjpeg',
  'png',
  'psd',
  'tiff',
  'tif',
];

export default class ListFileWidget extends PureComponent {
  state = { previewOpen: false };
  render() {
    const { previewOpen } = this.state;
    let { value, item } = this.props;

    if (isPlainObject(value)) {
      value = value.src;
    }

    if (item.type && item.type.includes('video')) {
      return (
        <ImgWrapper>
          <ReactPlayer
            url={value}
            width={128}
            height={128}
            config={{
              vimeo: { playerOptions: { autopause: true }, preload: true },
            }}
          />
        </ImgWrapper>
      );
    }
    const isSupported = SUPPORTED_IMGIX_FORMATS.includes(
      path.extname(value).substring(1)
    );
    const image = isSupported
      ? value
      : buildURL(`${process.env.REACT_APP_IMGIX_ENDPOINT}/placeholder.png`, {
          w: 360,
          txt: path
            .extname(value)
            .substring(1)
            .toUpperCase(),
          txtsize: 24,
          txtpad: 20,
          txtcolor: '#767676',
          txtalign: 'right,middle',
          txtfont: 'Futura COndensed Medium',
        });
    const lqip = buildURL(value, { w: 16, h: 16, auto: 'format' });
    return (
      <ImgWrapper>
        <LazyLoadImgix
          className="lazyload blur-up"
          src={image}
          width={128}
          height={128}
          imgixParams={{ crop: 'entropy' }}
          htmlAttributes={{ src: isSupported ? lqip : image }}
          attributeConfig={{
            src: 'data-src',
            srcSet: 'data-srcset',
            sizes: 'data-sizes',
          }}
        />
        {isSupported && (
          <HoverOverlay onClick={() => this.setState({ previewOpen: true })}>
            <Icon
              theme="textPrimaryOnDark"
              icon="zoom_in"
              style={{ fontSize: '3rem' }}
            />
          </HoverOverlay>
        )}
        <PreviewDialog
          open={previewOpen}
          onClose={() => this.setState({ previewOpen: false })}>
          <DialogContent>
            <LazyLoadImgix
              className="lazyload"
              src={image}
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
