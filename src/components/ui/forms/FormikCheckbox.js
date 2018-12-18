import React, { Fragment } from 'react';
import { Checkbox } from '@rmwc/checkbox';
import { TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';

const FormikCheckbox = ({
  field: { value, ...field }, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  help,
  ...props
}) => (
  <Fragment>
    <Checkbox checked={!!value} {...field} {...props} />
    {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
    <ErrorMessage name={field.name} component={TextFieldHelperText} />
  </Fragment>
);

export { FormikCheckbox };
