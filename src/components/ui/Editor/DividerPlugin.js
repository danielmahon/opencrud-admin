import React from 'react';
import { composeDecorators } from 'draft-js-plugins-editor';
import { ListDivider } from '@rmwc/list';
import { IconButton } from '@rmwc/icon-button';
import { EditorState, AtomicBlockUtils } from 'draft-js';

const addComponent = entityType => (editorState, data) => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    entityType,
    'IMMUTABLE',
    data
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = AtomicBlockUtils.insertAtomicBlock(
    editorState,
    entityKey,
    ' '
  );

  return EditorState.forceSelection(
    newEditorState,
    newEditorState.getCurrentContent().getSelectionAfter()
  );
};

const createDividerPlugin = ({ entityType = 'divider', focusPlugin } = {}) => {
  let PluginComponent = ({ className, onClick }) => {
    return <ListDivider className={className} onClick={onClick} />;
  };
  if (focusPlugin) {
    const decorator = composeDecorators(focusPlugin.decorator);
    PluginComponent = decorator(PluginComponent);
  }
  return {
    blockRendererFn: (block, { getEditorState }) => {
      if (block.getType() === 'atomic') {
        const contentState = getEditorState().getCurrentContent();
        const entity = block.getEntityAt(0);
        if (!entity) return null;
        const type = contentState.getEntity(entity).getType();
        if (type === entityType) {
          return {
            component: PluginComponent,
            editable: false,
          };
        }
      }
      return null;
    },
    DividerButton: ({ getEditorState, setEditorState }) => {
      return (
        <IconButton
          type="button"
          onClick={event => {
            event.preventDefault();
            const editorState = getEditorState();
            const newEditorState = addComponent(entityType)(editorState);
            setEditorState(newEditorState);
          }}
          icon="vertical_align_center"
        />
      );
    },
  };
};

export { createDividerPlugin };
