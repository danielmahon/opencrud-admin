import React, { Fragment, PureComponent } from 'react';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import { Dashboard } from '@uppy/react';
import { Elevation } from '@rmwc/elevation';
import SparkMD5 from 'spark-md5';
import ChunkedFileReader from 'chunked-file-reader';
import { buildURL } from 'react-imgix';

class FormikImageField extends PureComponent {
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

    return (
      <Fragment>
        {value && (
          <Elevation
            z={4}
            style={{
              display: 'inline-flex',
              borderRadius: '.25rem',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}>
            <img
              src={buildURL(value, {
                height: 480,
                fit: 'max',
              })}
              alt="preview"
              style={{
                maxWidth: '100%',
              }}
            />
          </Elevation>
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
