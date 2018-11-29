import React from 'react';
import { Typography } from '@rmwc/typography';

export default ({ children, ...props }) => {
  return (
    <Typography use="body1" tag="p" {...props}>
      {children}
    </Typography>
  );
};
