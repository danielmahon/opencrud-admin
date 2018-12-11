import React, { Component, Fragment } from 'react';

import {
  HeadlineOneButton,
  HeadlineTwoButton,
  BlockquoteButton,
  CodeBlockButton,
} from 'draft-js-buttons';
import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin';
import styled from 'styled-components';

// import buttonStyles from './buttonStyles.css';
// import toolbarStyles from './toolbarStyles.css';
// import blockTypeSelectStyles from './blockTypeSelectStyles.css';

// Setting the side Toolbar at right position(default is left) and styling with custom theme
const sideToolbarPlugin = createSideToolbarPlugin();
const { SideToolbar: DefaultSideToolbar } = sideToolbarPlugin;

const SideToolbarWrapper = styled('div')`
  position: absolute;
  top: -2rem;
  left: 1.875rem;
  > div {
    z-index: 8;
  }
`;
const StyledDefaultSideToolbar = styled(DefaultSideToolbar)`
  background: red;
`;

class SideToolbar extends Component {
  render() {
    const { addImage } = this.props;
    return (
      <SideToolbarWrapper>
        <StyledDefaultSideToolbar>
          {// may be use React.Fragment instead of div to improve perfomance after React 16
          externalProps => {
            return (
              <Fragment>
                <HeadlineOneButton {...externalProps} />
                <HeadlineTwoButton {...externalProps} />
                <BlockquoteButton {...externalProps} />
                <CodeBlockButton {...externalProps} />
              </Fragment>
            );
          }}
        </StyledDefaultSideToolbar>
      </SideToolbarWrapper>
    );
  }
}

export { sideToolbarPlugin, SideToolbar };
