import React, { Fragment } from 'react';
import { TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';
import { Typography } from '@rmwc/typography';
import { ListDivider } from '@rmwc/list';

const FormikListField = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  label,
  help,
  ...props
}) => {
  return (
    <Fragment>
      <ListDivider />
      <Typography use="body1" tag="p">
        {label}
      </Typography>
      <Typography use="body2" tag="p">
        {field.value && field.value.length
          ? field.value
              .map(value => {
                return value.title;
              })
              .join(', ')
          : 'none'}
      </Typography>
      {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
      <ErrorMessage name={field.name} component={TextFieldHelperText} />
      <ListDivider />
    </Fragment>
  );
};

export { FormikListField };
