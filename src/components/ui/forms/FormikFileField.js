import React, { Fragment, PureComponent } from 'react';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { Icon } from '@rmwc/icon';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import { Dashboard } from '@uppy/react';
import { Elevation } from '@rmwc/elevation';
import SparkMD5 from 'spark-md5';
import ChunkedFileReader from 'chunked-file-reader';
import Imgix, { buildURL } from 'react-imgix';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogButton,
} from '@rmwc/dialog';
import styled from 'styled-components';
import path from 'path';
import { isEmpty } from 'lodash';
import { Subscribe } from 'unstated';
import { AuthState } from '../../../state';

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

const DashboardWrapper = styled('div')`
  .uppy-Informer p {
    background-color: red;
    font-weight: 600 !important;
  }
`;

const PreviewDialog = styled(Dialog)`
  z-index: 2000;
  .mdc-dialog__content {
    padding: 0;
  }
  .mdc-dialog__surface {
    overflow: hidden;
    max-width: calc(100vw - 4rem);
    img {
      max-width: 100%;
    }
  }
  .mdc-dialog__scrim {
    background-color: ${({ theme }) => theme.rmwc.overlay};
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

class FormikFileFieldRoot extends PureComponent {
  state = { previewOpen: false };
  constructor(props) {
    super(props);
    this.uppy = Uppy({
      restrictions: { maxNumberOfFiles: 1 },
      autoProceed: false,
    });
    this.uppy.use(AwsS3, {
      limit: 1,
      timeout: 1000 * 60 * 60,
      getUploadParameters: async file => {
        // Add fingerprint to file
        const checksum = await this.getFileMD5(file.data);
        // Send a request to our signing endpoint.
        const response = await fetch(
          process.env.REACT_APP_GRAPHQL_ENDPOINT + '/getSignedPutUrl',
          {
            method: 'post',
            // Send and receive JSON.
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              Authorization: `Bearer ${props.auth.token}`,
            },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              checksum,
            }),
          }
        );
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        return result;
      },
    });
    this.uppy.on('upload-error', (file, error) => {
      this.uppy.info(error, 'error', 5000);
    });
    this.uppy.on('complete', result => {
      if (result.failed.length || !result.successful.length) return;
      const meta = result.successful[0].meta;
      this.props.form.setValues({
        ...this.props.form.values,
        [this.props.field.name]: `${process.env.REACT_APP_IMGIX_ENDPOINT}/${
          meta.key
        }`,
        filename: meta.filename,
        checksum: meta.checksum,
      });
      this.props.form.submitForm();
    });
  }
  getFileMD5 = file => {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer();
      const reader = new ChunkedFileReader();
      reader.subscribe('chunk', e => {
        spark.append(e.chunk);
      });
      reader.subscribe('end', e => {
        const rawHash = spark.end();
        resolve(rawHash);
      });
      reader.readChunks(file);
    });
  };
  componentDidUpdate = async () => {
    const { form, field } = this.props;
    const files = this.uppy.getFiles();
    if (
      form.isSubmitting &&
      !form.isValidating &&
      !form.isValid &&
      files.length
    ) {
      const invalidFields = await form.validateForm({
        ...form.values,
        [this.props.field.name]: files[0].name,
        filename: files[0].name,
        checksum: files[0].id,
      });
      if (isEmpty(invalidFields)) {
        this.uppy.upload();
      }
    } else if (form.isValidating && form.errors[field.name] && !files.length) {
      this.uppy.info(form.errors[field.name], 'error', 5000);
    }
  };
  componentWillUnmount = () => {
    this.uppy.close();
  };
  render() {
    const {
      field: { value, ...field }, // { name, value, onChange, onBlur }
      form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
      help,
      ...props
    } = this.props;
    const { previewOpen } = this.state;
    const isSupported = SUPPORTED_IMGIX_FORMATS.includes(
      path.extname(value).substring(1)
    );
    const image = isSupported
      ? value
      : buildURL(`${process.env.REACT_APP_IMGIX_ENDPOINT}/placeholder.png`, {
          w: '100%',
          txt: path
            .extname(value)
            .substring(1)
            .toUpperCase(),
          txtsize: 48,
          txtpad: 164,
          txtcolor: '#767676',
          txtalign: 'right,middle',
          txtfont: 'Futura COndensed Medium',
        });
    const lqip = isSupported
      ? buildURL(value, { w: 16, h: 16, auto: 'format' })
      : image;
    return (
      <Fragment>
        {value && (
          <Fragment>
            <Elevation
              z={4}
              style={{
                display: 'inline-flex',
                borderRadius: '.25rem',
                overflow: 'hidden',
                marginBottom: '1rem',
                position: 'relative',
              }}>
              <LazyLoadImgix
                className="lazyload blur-up"
                src={image}
                alt="preview"
                height={480}
                imgixParams={{ fit: 'max' }}
                htmlAttributes={{ src: lqip }}
                attributeConfig={{
                  src: 'data-src',
                  srcSet: 'data-srcset',
                  sizes: 'data-sizes',
                }}
              />
              {isSupported && (
                <HoverOverlay
                  onClick={() => this.setState({ previewOpen: true })}>
                  <Icon
                    theme="textPrimaryOnDark"
                    icon="zoom_in"
                    style={{ fontSize: '3rem' }}
                  />
                </HoverOverlay>
              )}
            </Elevation>
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
          </Fragment>
        )}
        {value && (
          <TextField
            {...field}
            {...props}
            type="text"
            value={value || ''}
            disabled
          />
        )}
        {this.uppy && !value && (
          <DashboardWrapper>
            <Dashboard
              {...field}
              {...props}
              uppy={this.uppy}
              plugins={['AwsS3', 'GoogleDrive']}
              width={1920}
              height={400}
              hideUploadButton={true}
              proudlyDisplayPoweredByUppy={false}
            />
          </DashboardWrapper>
        )}
        {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
        {/* <ErrorMessage
          name={field.name}
          component={TextFieldHelperText}
          persistent
          validationMsg
        /> */}
      </Fragment>
    );
  }
}

const FormikFileField = props => {
  return (
    <Subscribe to={[AuthState]}>
      {({ state }) => <FormikFileFieldRoot auth={state} {...props} />}
    </Subscribe>
  );
};

export { FormikFileField };
