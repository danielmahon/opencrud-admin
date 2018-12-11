import React, { Component, Fragment } from 'react';
import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin';
import styled from 'styled-components';
import { IconButton } from '@rmwc/icon-button';

// Setting the side Toolbar at right position(default is left) and styling with custom theme
const sideToolbarPlugin = createSideToolbarPlugin();
const { SideToolbar: DefaultSideToolbar } = sideToolbarPlugin;

const SideToolbarWrapper = styled('div')`
  [class*='wrapper'] {
    z-index: 8;
    left: 0.375rem !important;
    /* transform: scale(1) !important; */
    /* visibility: visible !important; */
    /* [class*='blockType'] {
      border: 1px solid white;
      background: var(--mdc-theme-text-primary-on-background);
      svg {
        fill: var(--mdc-theme-text-primary-on-dark);
      }
    } */
    [class*='popup'] {
      width: auto;
      /* transform: scale(1) !important; */
      /* visibility: visible !important; */
    }
  }
`;
const StyledDefaultSideToolbar = styled(DefaultSideToolbar)`
  background: red;
`;

class AddImageButton extends Component {
  openPrompt = () => {
    const { getEditorState, setEditorState, imagePlugin } = this.props;
    const url = window.prompt('Paste the image url ...');
    if (url) {
      setEditorState(imagePlugin.addImage(getEditorState(), url));
    }
  };
  render() {
    return <IconButton onClick={this.openPrompt} icon="add_a_photo" />;
  }
}

class SideToolbar extends Component {
  render() {
    const { plugins, buttons } = this.props;
    const { imagePlugin } = plugins;
    return (
      <SideToolbarWrapper>
        <StyledDefaultSideToolbar>
          {// may be use React.Fragment instead of div to improve perfomance after React 16
          externalProps => {
            return (
              <Fragment>
                <AddImageButton {...externalProps} imagePlugin={imagePlugin} />
                {buttons.map((ButtonComponent, i) => {
                  return <ButtonComponent {...externalProps} key={i} />;
                })}
              </Fragment>
            );
          }}
        </StyledDefaultSideToolbar>
      </SideToolbarWrapper>
    );
  }
}

export { sideToolbarPlugin, SideToolbar };
