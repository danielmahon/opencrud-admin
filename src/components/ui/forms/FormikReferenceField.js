import React, { Fragment } from 'react';
import { Select } from '@rmwc/select';
import { IconButton } from '@rmwc/icon-button';
import { CircularProgress } from '@rmwc/circular-progress';
import { TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';
import { Query } from 'react-apollo';
import { navigate } from '@reach/router';

import { remote } from '../../../graphs';

const FormikReferenceField = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors, setFieldValue }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  help,
  referenceType,
  referenceLabel,
  referencePath,
  ...props
}) => (
  <Query query={remote.query[`${referenceType}Connection`]}>
    {({ loading, data }) => {
      if (loading) {
        return (
          <Fragment>
            <Select
              label={field.name}
              options={['Loading...']}
              value={'Loading...'}
            />
            <IconButton
              disabled
              type="button"
              icon={<CircularProgress />}
              style={{ verticalAlign: 'middle' }}
            />
          </Fragment>
        );
      }
      const name = `${referenceType}Connection`;
      const items = data[name].edges
        .map(e => e.node)
        .map(item => {
          const label =
            item[referenceLabel] || item.name || item.title || item.id;
          return {
            label: label,
            value: item.id,
            key: item.id,
            data: item,
          };
        });
      return (
        <Fragment>
          <Select
            {...field}
            {...props}
            outlined
            value={field.value.id}
            onChange={evt => {
              setFieldValue(
                field.name,
                items.find(({ value }) => value === evt.target.value).data
              );
            }}
            options={items}
          />
          {referencePath && (
            <IconButton
              type="button"
              icon="link"
              onClick={() => navigate(referencePath)}
            />
          )}
          {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
          <ErrorMessage name={field.name} component={TextFieldHelperText} />
        </Fragment>
      );
    }}
  </Query>
);

export { FormikReferenceField };
