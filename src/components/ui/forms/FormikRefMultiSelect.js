import React, { Fragment } from 'react';
import { TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';
import Select from 'react-select';
import { Query } from 'react-apollo';
import { plural } from 'pluralize';

import { remote } from '../../../graphs';
import { getTypeName } from '../../../providers/RemoteGraphProvider';
import { Typography } from 'rmwc';

const FormikRefMultiSelect = ({
  field, // { name, value, onChange, onBlur }
  form: { setFieldValue },
  help,
  label,
  schemaField,
  ...props
}) => {
  const referenceType = plural(getTypeName(schemaField.type).toLowerCase());
  const name = `${referenceType}Connection`;
  return (
    <Query query={remote.query[name]} fetchPolicy="cache-and-network">
      {({ loading, data }) => {
        if (loading) return null;
        const value = field.value
          ? field.value.map(data => ({
              label: data.name,
              value: data.id,
              data: data,
            }))
          : [];
        const options = data[name].edges.map(({ node }) => {
          return {
            label: node.name,
            value: node.id,
            data: node,
          };
        });
        return (
          <Fragment>
            <Typography use="caption">{label}</Typography>
            <Select
              {...field}
              {...props}
              value={value}
              placeholder={`Select ${label}...`}
              onChange={newValues => {
                setFieldValue(field.name, newValues.map(val => val.data));
              }}
              isMulti
              isSearchable
              options={options}
            />
            {help && (
              <TextFieldHelperText persistent>{help}</TextFieldHelperText>
            )}
            <ErrorMessage name={field.name} component={TextFieldHelperText} />
          </Fragment>
        );
      }}
    </Query>
  );
};

export { FormikRefMultiSelect };
