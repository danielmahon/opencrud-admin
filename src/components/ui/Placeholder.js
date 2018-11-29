import React from 'react';
import ReactPlaceholder from 'react-placeholder';

const Placeholder = ({ type = 'textRow', width, wide }) => {
  const _width = width || wide ? 360 : 128;
  return (
    <ReactPlaceholder
      type={type}
      ready={false}
      showLoadingAnimation
      style={{ display: 'inline-block', width: `${_width}px` }}>
      Lorem ipsum dolor
    </ReactPlaceholder>
  );
};

export default Placeholder;
