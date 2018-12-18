import React, { Fragment } from 'react';
import { Select } from '@rmwc/select';
import { TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';

import { remote } from '../../../graphs';

const FormikSelect = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  path,
  help,
  ...props
}) => {
  const type = remote.schema.types.find(
    type => type.name.toLowerCase() === field.name
  );
  const items = type.enumValues.map(e => {
    return {
      label: e.name,
      value: e.name,
    };
  });
  return (
    <Fragment>
      <Select {...field} {...props} outlined options={items} />
      {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
      <ErrorMessage name={field.name} component={TextFieldHelperText} />
    </Fragment>
  );
};

export { FormikSelect };
