import React, { Component, Fragment } from 'react';
import createInlineToolbarPlugin, {
  Separator,
} from 'draft-js-inline-toolbar-plugin';
import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  // HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton,
} from 'draft-js-buttons';
import styled from 'styled-components';
import { Icon } from '@rmwc/icon';
import createLinkPlugin from 'draft-js-anchor-plugin';

const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar: DefaultInlineToolbar } = inlineToolbarPlugin;
const linkPlugin = createLinkPlugin();

const InlineToolbarWrapper = styled('div')`
  > div {
    z-index: 10;
  }
`;
const HeadlineButtonWrapper = styled('div')`
  display: inline-block;
`;
const HeadlineButton = styled('button')`
  background: #fbfbfb;
  color: #888;
  font-size: 18px;
  border: 0;
  padding-top: 5px;
  vertical-align: bottom;
  height: 34px;
  width: 36px;
  &:hover,
  :focus {
    background: #f3f3f3;
  }
`;

class HeadlinesPicker extends Component {
  componentDidMount() {
    setTimeout(() => {
      window.addEventListener('click', this.onWindowClick);
    });
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
  }

  onWindowClick = () => {
    // Call `onOverrideContent` again with `undefined`
    // so the toolbar can show its regular content again.
    this.props.onOverrideContent(undefined);
  };

  render() {
    const buttons = [HeadlineTwoButton, HeadlineThreeButton];
    return (
      <div>
        {buttons.map((Button, i) => (
          <Button key={i} {...this.props} />
        ))}
      </div>
    );
  }
}

class HeadlinesButton extends Component {
  // When using a click event inside overridden content, mouse down
  // events needs to be prevented so the focus stays in the editor
  // and the toolbar remains visible  onMouseDown = (event) => event.preventDefault()
  onMouseDown = event => event.preventDefault();

  onClick = () => {
    // A button can call `onOverrideContent` to replace the content
    // of the toolbar. This can be useful for displaying sub
    // menus or requesting additional information from the user.
    this.props.onOverrideContent(HeadlinesPicker);
  };

  render() {
    return (
      <HeadlineButtonWrapper onMouseDown={this.onMouseDown}>
        <HeadlineButton onClick={this.onClick}>
          <Icon icon="title" />
        </HeadlineButton>
      </HeadlineButtonWrapper>
    );
  }
}

class InlineToolbar extends Component {
  render() {
    return (
      <InlineToolbarWrapper>
        <DefaultInlineToolbar>
          {// may be use React.Fragment instead of div to improve perfomance after React 16
          externalProps => (
            <Fragment>
              <BoldButton {...externalProps} />
              <ItalicButton {...externalProps} />
              <UnderlineButton {...externalProps} />
              <CodeButton {...externalProps} />
              <linkPlugin.LinkButton {...externalProps} />
              <Separator {...externalProps} />
              <HeadlinesButton {...externalProps} />
              <UnorderedListButton {...externalProps} />
              <OrderedListButton {...externalProps} />
              <BlockquoteButton {...externalProps} />
              <CodeBlockButton {...externalProps} />
            </Fragment>
          )}
        </DefaultInlineToolbar>
      </InlineToolbarWrapper>
    );
  }
}

export { inlineToolbarPlugin, InlineToolbar, linkPlugin };
