import React, { Component, Fragment } from 'react';
import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin';
import styled from 'styled-components';
import { IconButton } from '@rmwc/icon-button';
import addIcon from '../../../images/baseline-add-24px.svg';
import expandIcon from '../../../images/baseline-expand_more-24px.svg';

// Setting the side Toolbar at right position(default is left) and styling with custom theme
const sideToolbarPlugin = createSideToolbarPlugin();
const { SideToolbar: DefaultSideToolbar } = sideToolbarPlugin;

const SideToolbarWrapper = styled('div')`
  [class^='draftJsToolbar__wrapper'] {
    z-index: 8;
    left: -1.125rem !important;
    /* transform: scale(1) !important; */
    /* visibility: visible !important; */
    [class*='draftJsToolbar__blockType'] {
      transition: transform 200ms ease, display 200ms ease;
      svg {
        display: none;
      }
      ::before {
        content: url(${addIcon});
        display: ${props => (props['data-active'] ? 'none' : 'block')};
      }
      ::after {
        content: url(${expandIcon});
        display: ${props => (props['data-active'] ? 'block' : 'none')};
      }
      transform: rotate(${props => (props['data-active'] ? 0 : '-90deg')});
    }
    [class*='draftJsToolbar__popup'] {
      width: auto;
      border-radius: 0.25rem;
      /* transform: scale(1) !important; */
      /* visibility: visible !important; */
    }
  }
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
  state = { active: false };
  render() {
    const { plugins, buttons } = this.props;
    const { imagePlugin } = plugins;
    return (
      <SideToolbarWrapper
        onMouseOver={() => this.setState({ active: true })}
        onMouseLeave={() => this.setState({ active: false })}
        data-active={this.state.active}>
        <DefaultSideToolbar>
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
        </DefaultSideToolbar>
      </SideToolbarWrapper>
    );
  }
}

export { sideToolbarPlugin, SideToolbar };
