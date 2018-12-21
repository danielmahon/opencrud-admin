import React, { Fragment, PureComponent } from 'react';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { Icon } from '@rmwc/icon';
import { ErrorMessage } from 'formik';
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

class FormikImageField extends PureComponent {
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
          process.env.REACT_APP_GRAPHQL_ENDPOINT + '/getSignedUrl',
          {
            method: 'post',
            // Send and receive JSON.
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
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
      props.form.setValues({
        src: `${process.env.REACT_APP_IMGIX_ENDPOINT}/${meta.key}`,
        filename: meta.filename,
        checksum: meta.checksum,
      });
      props.form.submitForm();
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
    const lqip = buildURL(value, { w: 16, h: 16, auto: 'format' });
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
                src={value}
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
              <HoverOverlay
                onClick={() => this.setState({ previewOpen: true })}>
                <Icon
                  theme="textPrimaryOnDark"
                  icon="zoom_in"
                  style={{ fontSize: '3rem' }}
                />
              </HoverOverlay>
            </Elevation>
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
          <Dashboard
            {...field}
            {...props}
            uppy={this.uppy}
            plugins={['AwsS3', 'GoogleDrive']}
            width={1920}
            height={400}
            // note="Images and video only, 2–3 files, up to 1 MB"
            proudlyDisplayPoweredByUppy={false}
          />
        )}
        {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
        <ErrorMessage name={field.name} component={TextFieldHelperText} />
      </Fragment>
    );
  }
}

export { FormikImageField };
