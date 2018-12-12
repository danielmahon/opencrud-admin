import React, { Component, Fragment } from 'react';
import createInlineToolbarPlugin, {
  Separator,
} from 'draft-js-inline-toolbar-plugin';
import styled from 'styled-components';
import { Typography } from '@rmwc/typography';
import { IconButton } from '@rmwc/icon-button';
import createLinkPlugin from 'draft-js-anchor-plugin';

const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar: DefaultInlineToolbar } = inlineToolbarPlugin;
const linkPlugin = createLinkPlugin();

const InlineToolbarWrapper = styled('div')`
  [class^='draftJsToolbar__toolbar'] {
    z-index: 10;
    border-radius: 0.25rem;
  }
`;

const Button = ({
  icon,
  toggleBlockType,
  toggleInlineStyle,
  isActive,
  style,
}) => {
  return (
    <IconButton
      style={{ ...style, opacity: isActive ? 1 : 0.54 }}
      onClick={toggleBlockType || toggleInlineStyle}
      onMouseDown={event => event.preventDefault()}
      icon={icon}
    />
  );
};

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
    this.props.onOverrideContent(undefined);
  };
  render() {
    const { buttons } = this.props;
    return (
      <div>
        {buttons.map((HButton, i) => (
          <HButton key={i}>
            <Button
              style={{ padding: 0 }}
              icon={<Typography use="button">{`H${i + 1}`}</Typography>}
            />
          </HButton>
        ))}
      </div>
    );
  }
}

class HeadlinesButton extends Component {
  onClick = () => {
    // A button can call `onOverrideContent` to replace the content
    // of the toolbar. This can be useful for displaying sub
    // menus or requesting additional information from the user.
    this.props.onOverrideContent(() => <HeadlinesPicker {...this.props} />);
  };
  render() {
    return (
      <IconButton
        type="button"
        onClick={this.onClick}
        icon="title"
        onMouseDown={evt => evt.preventDefault()}
      />
    );
  }
}

class InlineToolbar extends Component {
  render() {
    const { richButtonsPlugin } = this.props;
    const {
      // inline buttons
      ItalicButton,
      BoldButton,
      MonospaceButton,
      UnderlineButton,
      // block buttons
      ParagraphButton,
      BlockquoteButton,
      CodeButton,
      OLButton,
      ULButton,
      H1Button,
      H2Button,
      H3Button,
      H4Button,
      H5Button,
      H6Button,
    } = richButtonsPlugin;
    return (
      <InlineToolbarWrapper>
        <DefaultInlineToolbar>
          {// may be use React.Fragment instead of div to improve perfomance after React 16
          externalProps => (
            <Fragment>
              <BoldButton>
                <Button icon="format_bold" />
              </BoldButton>
              <ItalicButton>
                <Button icon="format_italic" />
              </ItalicButton>
              <UnderlineButton>
                <Button icon="format_underline" />
              </UnderlineButton>
              <MonospaceButton>
                <Button icon="code" />
              </MonospaceButton>
              <linkPlugin.LinkButton {...externalProps} />
              <Separator {...externalProps} />
              <ParagraphButton>
                <Button icon="format_clear" />
              </ParagraphButton>
              <HeadlinesButton
                {...externalProps}
                richButtonsPlugin={richButtonsPlugin}
                buttons={[
                  H1Button,
                  H2Button,
                  H3Button,
                  H4Button,
                  H5Button,
                  H6Button,
                ]}
              />
              <ULButton>
                <Button icon="format_list_bulleted" />
              </ULButton>
              <OLButton>
                <Button icon="format_list_numbered" />
              </OLButton>
              <BlockquoteButton>
                <Button icon="format_quote" />
              </BlockquoteButton>
              <CodeButton>
                <Button icon="code" />
              </CodeButton>
            </Fragment>
          )}
        </DefaultInlineToolbar>
      </InlineToolbarWrapper>
    );
  }
}

export { inlineToolbarPlugin, InlineToolbar, linkPlugin };
