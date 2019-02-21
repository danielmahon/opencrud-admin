import React, { Fragment } from 'react';
import { TextFieldHelperText, TextField } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';

const FormikTextField = ({
  field: { value, ...field }, // { name, value, onChange, onBlur }
  form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  help,
  ...props
}) => {
  return (
    <Fragment>
      <TextField
        {...field}
        {...props}
        outlined
        invalid={form.errors[field.name]}
        type="text"
        value={value || ''}
      />
      {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
      <ErrorMessage
        name={field.name}
        component={TextFieldHelperText}
        persistent
        validationMsg
      />
    </Fragment>
  );
};

export { FormikTextField };
