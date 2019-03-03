import React, { Fragment } from 'react';
import { Select } from '@rmwc/select';
import { IconButton } from '@rmwc/icon-button';
import { CircularProgress } from '@rmwc/circular-progress';
import { TextFieldHelperText } from '@rmwc/textfield';
import { ErrorMessage } from 'formik';
import { Query } from 'react-apollo';
import { navigate } from '@reach/router';
import { plural } from 'pluralize';

import { remote } from '../../../graphs';

const FormikReferenceField = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors, setFieldValue }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  help,
  referenceType,
  referenceLabel,
  referencePath,
  ...props
}) => {
  return (
    <Query
      query={remote.query[`${plural(referenceType)}Connection`]}
      fetchPolicy="cache-and-network"
      variables={{ orderBy: 'createdAt_DESC' }}>
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
        const name = `${plural(referenceType)}Connection`;
        const items = data[name].edges.reduce(
          (acc, { node }) => {
            const label =
              node[referenceLabel] || node.name || node.title || node.id;
            acc.push({
              label: label,
              value: node.id,
              data: node,
            });
            return acc;
          },
          [
            {
              label: 'None',
              value: '',
              data: {},
            },
          ]
        );
        return (
          <Fragment>
            <Select
              {...props}
              name={field.name}
              enhanced
              outlined
              value={field.value ? field.value.id : ''}
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
            {help && (
              <TextFieldHelperText persistent>{help}</TextFieldHelperText>
            )}
            <ErrorMessage
              name={field.name}
              component={TextFieldHelperText}
              persistent
              validationMsg
            />
          </Fragment>
        );
      }}
    </Query>
  );
};

export { FormikReferenceField };
