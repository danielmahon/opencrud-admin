import React, { Fragment } from 'react';
import { TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';
import { Typography } from '@rmwc/typography';

const FormikListField = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  label,
  help,
  ...props
}) => {
  return (
    <Fragment>
      <Typography use="body1" tag="p">
        {label}
      </Typography>
      <Typography use="body2">
        {field.value.length
          ? field.value
              .map(value => {
                return value.title;
              })
              .join(', ')
          : 'none'}
      </Typography>
      {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
      <ErrorMessage name={field.name} component={TextFieldHelperText} />
    </Fragment>
  );
};

export { FormikListField };
