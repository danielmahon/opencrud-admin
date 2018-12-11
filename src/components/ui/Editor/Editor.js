import React, { Component, Fragment } from 'react';
import { GridCell } from '@rmwc/grid';
import { Icon } from '@rmwc/icon';
import { Typography } from '@rmwc/typography';
import { Button } from '@rmwc/button';
import { debounce, capitalize } from 'lodash';
import styled from 'styled-components';
// import {
//   DraftJS,
//   MegadraftEditor,
//   editorStateFromRaw,
//   editorStateToJSON,
// } from 'megadraft';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import DraftJSEditor from 'draft-js-plugins-editor';
import createUndoPlugin from 'draft-js-undo-plugin';

import { editor } from '../../../config';
import {
  InlineToolbar,
  inlineToolbarPlugin,
  SideToolbar,
  sideToolbarPlugin,
} from './index';

const undoPlugin = createUndoPlugin({
  undoContent: <Button tag="div">undo</Button>,
  redoContent: <Button tag="div">redo</Button>,
});
const { UndoButton, RedoButton } = undoPlugin;

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

const EditorTitle = styled(Typography)`
  padding-left: 0.75rem;
`;
const EditorWrapper = styled('div')`
  position: relative;
  border: 1px solid #d7d7d7;
  border-radius: 0.25rem;
  padding: 2rem 2rem 4rem 2rem;
  /* Align placeholder ontop of first text line */
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
  .paragraph {
    padding-bottom: 1rem;
  }
  .align-right {
    text-align: right;
  }
  .align-center {
    text-align: center;
  }
`;

export class Editor extends Component {
  constructor(props) {
    super(props);
    const { field } = props;
    const initialEditorState = field.value
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(field.value)))
      : EditorState.createEmpty();
    this.state = {
      editorState: initialEditorState,
      initialEditorState,
    };
  }
  updateForm = debounce(
    editorState => {
      const { field, form } = this.props;
      form.setFieldValue(
        field.name,
        JSON.stringify(convertToRaw(editorState.getCurrentContent()))
      );
    },
    250,
    { leading: true, trailing: true }
  );
  handleEditorStateChange = editorState => {
    this.setState({ editorState });
  };
  componentDidUpdate = prevProps => {
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
    const { editorState } = this.state;
    const { field } = this.props;
    return (
      <GridCell span={12}>
        <EditorTitle use="body1" theme="textSecondaryOnBackground">
          {capitalize(field.name)}
        </EditorTitle>
        <EditorWrapper>
          <DraftJSEditor
            placeholder="Type here..."
            editorState={editorState}
            plugins={[inlineToolbarPlugin, sideToolbarPlugin, undoPlugin]}
            onChange={editorState => {
              this.handleEditorStateChange(editorState);
              this.updateForm(editorState);
            }}
            blockStyleFn={contentBlock => {
              const type = contentBlock.getType();
              console.log(type);
              switch (type) {
                case 'header-one':
                  return 'mdc-typography--headline1';
                case 'header-two':
                  return 'mdc-typography--headline2';
                case 'header-three':
                  return 'mdc-typography--headline3';
                case 'header-four':
                  return 'mdc-typography--headline4';
                case 'header-fiv':
                  return 'mdc-typography--headline5';
                case 'header-six':
                  return 'mdc-typography--headline6';
                case 'unstyled':
                  return 'mdc-typography--body1';
                default:
                  break;
              }
            }}
          />
          <InlineToolbar />
          <SideToolbar />
          <HistoryButtons>
            <UndoButton />
            <RedoButton />
          </HistoryButtons>
        </EditorWrapper>
      </GridCell>
    );
  }
}
