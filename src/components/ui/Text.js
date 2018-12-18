import React from 'react';
import { Typography } from '@rmwc/typography';

export default ({ children, padded, ...props }) => {
  return (
    <Typography
      use="body1"
      tag="div"
      {...props}
      style={{ ...props.style, padding: padded ? '1rem' : 0 }}>
      {children}
    </Typography>
  );
};
