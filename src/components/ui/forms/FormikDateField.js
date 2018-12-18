import React, { Fragment } from 'react';
import { DateTime } from 'luxon';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';

const FormikDateField = ({
  field: { value, ...field }, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  help,
  ...props
}) => {
  let date = DateTime.fromISO(value);
  if (date.isValid) {
    date = `${date.toISODate()}T${date.toLocaleString(
      DateTime.TIME_24_SIMPLE
    )}`;
  } else {
    date = '';
  }

  return (
    <Fragment>
      <TextField
        {...field}
        {...props}
        outlined
        type="datetime-local"
        value={date}
      />
      {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
      <ErrorMessage name={field.name} component={TextFieldHelperText} />
    </Fragment>
  );
};

export { FormikDateField };
