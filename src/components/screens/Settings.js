import React, { PureComponent, Component } from 'react';
// import { Link } from '@reach/router';
import { Grid, GridCell } from '@rmwc/grid';
import { Helmet } from 'react-helmet';
import { TabBar, Tab } from '@rmwc/tabs';
import Editor from 'draft-js-plugins-editor';
import createCodeEditorPlugin from 'draft-js-code-editor-plugin';
import { EditorState, ContentState } from 'draft-js';
import styled from 'styled-components';
import Prism from 'prismjs';
import createPrismPlugin from 'draft-js-prism-plugin';

import Text from '../ui/Text';
import { Subscribe, SettingsState } from '../../state';

const EditorWrapper = styled('div')`
  padding: 1rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme.rmwc.textHintOnBackground};
`;

class CodeEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createWithContent(
        ContentState.createFromText(props.code)
      ),
      plugins: [
        // Add the Prism plugin to the plugins array
        createPrismPlugin({ prism: Prism }),
        createCodeEditorPlugin(),
      ],
    };
  }
  onChange = editorState => {
    this.setState({ editorState });
  };
  componentDidUpdate = (prevProps, prevState) => {
    if (prevState !== this.state) {
      const myText = this.state.editorState.getCurrentContent().getPlainText();
      console.log(myText);
      this.props.update(JSON.parse(myText), this.props.activeTab);
    }
  };

  render() {
    return (
      <EditorWrapper>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          plugins={this.state.plugins}
        />
      </EditorWrapper>
    );
  }
}

class Settings extends PureComponent {
  state = { activeTab: 0 };
  render() {
    const { activeTab } = this.state;
    return (
      <Subscribe to={[SettingsState]}>
        {({ state: { resources }, update }) => (
          <Grid>
            <Helmet title="Settings" />
            <GridCell span={12}>
              {/* Controlled */}
              <Text use="headline5">Resource Settings</Text>
              <TabBar
                activeTabIndex={activeTab}
                onActivate={evt =>
                  this.setState({ activeTab: evt.detail.index })
                }>
                {resources.map(resource => {
                  return <Tab key={resource.type}>{resource.type}</Tab>;
                })}
              </TabBar>
            </GridCell>
            <GridCell span={12}>
              <CodeEditor
                activeTab={activeTab}
                code={JSON.stringify(resources[activeTab], null, 4)}
                update={update}
              />
            </GridCell>
          </Grid>
        )}
      </Subscribe>
    );
  }
}
export default Settings;
