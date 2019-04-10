import React, { Component } from 'react';
import { GridCell } from '@rmwc/grid';
import { Typography } from '@rmwc/typography';
import { Button } from '@rmwc/button';
import { debounce, startCase } from 'lodash';
import styled from 'styled-components';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import DraftJSEditor, { composeDecorators } from 'draft-js-plugins-editor';
import createUndoPlugin from 'draft-js-undo-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createAlignmentPlugin from 'draft-js-alignment-plugin';
import createImagePlugin from 'draft-js-image-plugin';
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin';
import createRichButtonsPlugin from 'draft-js-richbuttons-plugin';
import createResizeablePlugin from 'draft-js-resizeable-plugin';

import {
  InlineToolbar,
  inlineToolbarPlugin,
  SideToolbar,
  sideToolbarPlugin,
  linkPlugin,
  Counter,
  createDividerPlugin,
} from './index';

const undoPlugin = createUndoPlugin({
  undoContent: <Button tag="div">undo</Button>,
  redoContent: <Button tag="div">redo</Button>,
});
const { UndoButton, RedoButton } = undoPlugin;
const richButtonsPlugin = createRichButtonsPlugin();
const blockBreakoutPlugin = createBlockBreakoutPlugin();
const focusPlugin = createFocusPlugin();
const dividerPlugin = createDividerPlugin({ focusPlugin });
const { DividerButton } = dividerPlugin;
const resizeablePlugin = createResizeablePlugin();
const alignmentPlugin = createAlignmentPlugin();
const decorator = composeDecorators(
  alignmentPlugin.decorator,
  focusPlugin.decorator,
  resizeablePlugin.decorator
);
const imagePlugin = createImagePlugin({ decorator });
const { AlignmentTool } = alignmentPlugin;

const HistoryButtons = styled('div')`
  position: absolute;
  left: 0.5rem;
  bottom: 0.5rem;
  > button {
    background: none;
    border: none;
    padding: 0;
  }
`;
const AdditionalInfo = styled('div')`
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
`;

const EditorTitle = styled(Typography)`
  padding-left: 0.75rem;
`;
const EditorWrapper = styled('div')`
  position: relative;
  border: 1px solid #d7d7d7;
  border-radius: 0.25rem;
  padding: 2rem 2rem 4rem 2rem;
  /* Align placeholder ontop of first text line */
  .DraftEditor-root {
    position: relative;
  }
  .public-DraftEditorPlaceholder-root {
    color: var(--mdc-theme-text-hint-on-background);
    position: absolute;
    pointer-events: none;
  }
  .mdc-typography--body1 {
    margin: 1em 0;
  }
  .sidebar__menu {
    left: -3.125rem;
  }
  figure {
    margin: 0;
  }
  img {
    max-width: 100%;
    border-radius: 0.25rem;
    &[style*='float: left'] {
      margin: 0 1rem 1rem 0;
    }
    &[style*='float: right'] {
      margin: 0 0 1rem 1rem;
    }
  }
  blockquote {
    border-left: 4px solid #d7d7d7;
    margin-left: 0;
    padding-left: 1rem;
    font-style: italic;
    clear: both;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 2rem 0 1rem 0;
  }
`;

export class Editor extends Component {
  constructor(props) {
    super(props);
    const { field, config = {} } = props;
    const initialEditorState = field.value
      ? EditorState.createWithContent(convertFromRaw(field.value))
      : EditorState.createEmpty();
    this.state = {
      editorState: initialEditorState,
      initialEditorState,
      limit: config.limit || 0,
    };
  }
  updateForm = debounce(
    editorState => {
      const { field, form } = this.props;
      form.setFieldValue(
        field.name,
        convertToRaw(editorState.getCurrentContent())
      );
    },
    250,
    { leading: true, trailing: true }
  );
  handleEditorStateChange = editorState => {
    this.setState({ editorState });
  };
  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.form.dirty && !this.props.form.dirty) {
      this.setState({
        editorState: this.state.initialEditorState,
      });
    }
    if (!prevProps.form.isSubmitting && this.props.form.isSubmitting) {
      this.setState({
        initialEditorState: this.state.editorState,
      });
    }
  };
  render() {
    const { editorState, limit } = this.state;
    const { field } = this.props;
    return (
      <GridCell span={12}>
        <EditorTitle use="body1" theme="textSecondaryOnBackground">
          {startCase(field.name)}
        </EditorTitle>
        <EditorWrapper>
          <DraftJSEditor
            placeholder="Type here..."
            editorState={editorState}
            plugins={[
              inlineToolbarPlugin,
              sideToolbarPlugin,
              undoPlugin,
              linkPlugin,
              imagePlugin,
              focusPlugin,
              alignmentPlugin,
              resizeablePlugin,
              blockBreakoutPlugin,
              richButtonsPlugin,
              dividerPlugin,
            ]}
            onChange={editorState => {
              this.handleEditorStateChange(editorState);
              this.updateForm(editorState);
            }}
            blockStyleFn={contentBlock => {
              const type = contentBlock.getType();
              switch (type) {
                case 'header-one':
                  return 'mdc-typography--headline1';
                case 'header-two':
                  return 'mdc-typography--headline2';
                case 'header-three':
                  return 'mdc-typography--headline3';
                case 'header-four':
                  return 'mdc-typography--headline4';
                case 'header-five':
                  return 'mdc-typography--headline5';
                case 'header-six':
                  return 'mdc-typography--headline6';
                case 'blockquote':
                  return 'mdc-typography--headline5';
                case 'paragraph':
                case 'unstyled':
                  return 'mdc-typography--body1';
                default:
                  break;
              }
            }}
          />
          <InlineToolbar richButtonsPlugin={richButtonsPlugin} />
          <SideToolbar plugins={{ imagePlugin }} buttons={[DividerButton]} />
          <AlignmentTool />
          <HistoryButtons>
            <UndoButton />
            <RedoButton />
          </HistoryButtons>
          <AdditionalInfo>
            <Counter
              limit={limit}
              editorState={editorState}
              label="characters"
            />
          </AdditionalInfo>
        </EditorWrapper>
      </GridCell>
    );
  }
}
