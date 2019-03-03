import React from 'react';
import { TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';
import Select from 'react-select';
import { Query } from 'react-apollo';
import { plural } from 'pluralize';
import { Typography } from '@rmwc/typography';
import { remote } from '../../../graphs';

const FormikRefMultiSelect = ({
  field, // { name, value, onChange, onBlur }
  form: { setFieldValue },
  help,
  label,
  fieldConfig,
  schemaField,
  ...props
}) => {
  const referenceType = plural(fieldConfig.type.toLowerCase());
  const name = `${referenceType}Connection`;
  return (
    <Query query={remote.query[name]} fetchPolicy="cache-and-network">
      {({ loading, data }) => {
        if (loading) return null;
        const value = field.value
          ? field.value.map(data => ({
              label: data.title || data.name,
              value: data.id,
              data: data,
            }))
          : [];
        const options = data[name].edges.map(({ node }) => {
          return {
            label: node.title || node.name,
            value: node.id,
            data: node,
          };
        });
        return (
          <>
            <Typography use="caption">{label}</Typography>
            <Select
              {...field}
              {...props}
              styles={{
                // Needs to be higher than uppy's field (1004)
                menu: provided => ({ ...provided, zIndex: 1005 }),
              }}
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
          </>
        );
      }}
    </Query>
  );
};

export { FormikRefMultiSelect };
