import React, { PureComponent, Fragment } from 'react';
import { Grid, GridInner, GridCell } from '@rmwc/grid';
import { Helmet } from 'react-helmet';
import { TabBar, Tab } from '@rmwc/tabs';
import { Button } from '@rmwc/button';
import { Checkbox } from '@rmwc/checkbox';
import { Typography } from '@rmwc/typography';
import { Select } from '@rmwc/select';
import {
  List,
  ListItem,
  ListDivider,
  ListItemGraphic,
  ListItemMeta,
} from '@rmwc/list';
import { Query, Mutation } from 'react-apollo';
import { Transition, animated } from 'react-spring';
import { omit } from 'lodash';
import { Formik, Form, Field } from 'formik';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from 'react-sortable-hoc';
import { singular } from 'pluralize';

import Text from '../ui/Text';
import { remote } from '../../graphs';
import { FormikCheckbox, FormikTextField } from '../ui/forms';

const DragHandle = SortableHandle(() => (
  <ListItemGraphic icon="drag_handle" style={{ cursor: 'grab' }} />
));

let widgets = null;

const SortableItem = SortableElement(
  ({ field, name, idx, items, setFieldValue }) => {
    if (!widgets) {
      widgets = remote.schema.types.reduce(
        (acc, type) => {
          if (type.name === 'Widget') {
            return acc.concat(type.enumValues.map(val => val.name));
          }
          return acc;
        },
        ['Default']
      );
    }
    return (
      <ListItem span={12}>
        <DragHandle />
        {true ? (
          field.name
        ) : (
          <Typography theme="textHintOnBackground">{field.name}</Typography>
        )}
        <ListItemMeta>
          <Checkbox
            checked={field.enabled}
            onChange={evt => {
              const updatedFields = [...items];
              updatedFields[idx] = {
                ...field,
                enabled: evt.target.checked,
              };
              setFieldValue(name, updatedFields);
            }}
          />
        </ListItemMeta>
        <ListItemMeta style={{ marginLeft: 0 }}>
          <Select
            style={{ width: '8rem' }}
            options={widgets}
            value={field.widget || 'Default'}
            onChange={evt => {
              const updatedFields = [...items];
              updatedFields[idx] = {
                ...field,
                widget:
                  evt.target.value !== 'Default' ? evt.target.value : null,
              };
              setFieldValue(name, updatedFields);
            }}
          />
        </ListItemMeta>
      </ListItem>
    );
  }
);

const SortableList = SortableContainer(({ name, items, setFieldValue }) => {
  return (
    <List>
      <ListItem disabled ripple={false}>
        Field Name<ListItemMeta>Enabled?</ListItemMeta>
        <ListItemMeta
          style={{ marginLeft: 0, width: '8rem', textAlign: 'right' }}>
          Widget
        </ListItemMeta>
      </ListItem>
      {items.map((field, index) => {
        return (
          <Fragment key={field.id}>
            <SortableItem
              field={field}
              index={index}
              idx={index}
              items={items}
              name={name}
              setFieldValue={setFieldValue}
            />
            {index < items.length - 1 && <ListDivider />}
          </Fragment>
        );
      })}
    </List>
  );
});

class SettingsTab extends PureComponent {
  render() {
    const { model: config } = this.props;
    return (
      <Mutation mutation={remote.mutation.updateModelConfig}>
        {updateModelConfig => (
          <Formik
            initialValues={omit(config, '__typename')}
            onSubmit={async (
              { id, listFields, editFields, ...data },
              { resetForm }
            ) => {
              await updateModelConfig({
                variables: {
                  where: { id },
                  data: {
                    ...data,
                    listFields: {
                      update: listFields.map(
                        ({ id: fieldId, __typename, ...fieldData }) => ({
                          where: { id: fieldId },
                          data: fieldData,
                        })
                      ),
                    },
                    editFields: {
                      update: editFields.map(
                        ({ id: fieldId, __typename, ...fieldData }) => ({
                          where: { id: fieldId },
                          data: fieldData,
                        })
                      ),
                    },
                  },
                },
              });
              resetForm({ id, listFields, editFields, ...data });
            }}>
            {({ values, isSubmitting, dirty, setFieldValue }) => {
              return (
                <Form style={{ overflow: 'hidden' }}>
                  <GridInner>
                    <GridCell span={12}>
                      <Field
                        component={FormikCheckbox}
                        name="enabled"
                        label="Model Enabled"
                      />
                    </GridCell>
                    <GridCell span={12}>
                      <Field
                        component={FormikTextField}
                        name="description"
                        label="Description"
                        style={{ width: '100%' }}
                      />
                    </GridCell>
                    <GridCell span={12}>
                      <Field
                        component={FormikTextField}
                        name="icon"
                        label="Icon Name"
                      />
                    </GridCell>
                    <GridCell span={12}>
                      <ListDivider />
                    </GridCell>
                    <GridCell span={6}>
                      <GridInner>
                        <GridCell span={12}>
                          <Text use="headline5">List Fields</Text>
                        </GridCell>
                        <GridCell span={12}>
                          <SortableList
                            lockAxis="y"
                            name="listFields"
                            lockToContainerEdges={true}
                            useDragHandle={true}
                            config={config}
                            items={values.listFields}
                            setFieldValue={setFieldValue}
                            onSortEnd={({ oldIndex, newIndex }) => {
                              const newFields = arrayMove(
                                [...values.listFields],
                                oldIndex,
                                newIndex
                              ).map((field, idx) => {
                                field.order = idx;
                                return field;
                              });
                              setFieldValue('listFields', newFields);
                            }}
                          />
                        </GridCell>
                      </GridInner>
                    </GridCell>
                    <GridCell span={6}>
                      <GridInner>
                        <GridCell span={12}>
                          <Text use="headline5">Edit Fields</Text>
                        </GridCell>
                        <GridCell span={12}>
                          <SortableList
                            lockAxis="y"
                            name="editFields"
                            lockToContainerEdges={true}
                            useDragHandle={true}
                            items={values.editFields}
                            setFieldValue={setFieldValue}
                            onSortEnd={({ oldIndex, newIndex }) => {
                              const newFields = arrayMove(
                                [...values.editFields],
                                oldIndex,
                                newIndex
                              ).map((field, idx) => {
                                field.order = idx;
                                return field;
                              });
                              setFieldValue('editFields', newFields);
                            }}
                          />
                        </GridCell>
                      </GridInner>
                    </GridCell>

                    <GridCell span={12} style={{ marginBottom: '4rem' }}>
                      <Button
                        unelevated
                        type="submit"
                        disabled={isSubmitting || !dirty}>
                        Save
                      </Button>
                    </GridCell>
                  </GridInner>
                </Form>
              );
            }}
          </Formik>
        )}
      </Mutation>
    );
  }
}

class Settings extends PureComponent {
  state = { activeTab: 0, previousTab: null };
  update = state => {
    this.setState(state);
  };

  render() {
    const { activeTab, previousTab } = this.state;
    const { modelParam } = this.props;

    return (
      <Query
        query={remote.query.modelConfigsConnection}
        fetchPolicy="cache-and-network">
        {({ data, loading }) => {
          if (loading) return null;
          const models = data.modelConfigsConnection.edges.map(e => e.node);
          if (!models.length) {
            return <Text>Server error! No model configuration found.</Text>;
          }
          const items = models.map(model => (
            <SettingsTab key={model.type} model={model} />
          ));
          const currentTab =
            modelParam && previousTab === null
              ? models.findIndex(model => {
                  return model.type.toLowerCase() === singular(modelParam);
                })
              : activeTab;
          return (
            <Grid>
              <Helmet title="Settings" />
              <GridCell span={12}>
                {/* Controlled */}
                <Text use="headline5">Model Configuration</Text>
                <Text>Discovered {models.length} Models</Text>
                <TabBar
                  activeTabIndex={currentTab}
                  onActivate={evt => {
                    window.history.pushState(
                      { tab: models[evt.detail.index].type.toLowerCase() },
                      document.title,
                      `/settings/${models[evt.detail.index].type.toLowerCase()}`
                    );
                    this.setState({
                      activeTab: evt.detail.index,
                      previousTab: currentTab,
                    });
                  }}>
                  {models.map(model => {
                    return <Tab key={model.type}>{model.type}</Tab>;
                  })}
                </TabBar>
              </GridCell>
              <GridCell span={12} style={{ position: 'relative' }}>
                <Transition
                  native
                  items={items[currentTab]}
                  keys={item => item.key}
                  from={{
                    opacity: 0,
                    left: previousTab <= currentTab ? -256 : 256,
                    position: 'absolute',
                    width: '100%',
                  }}
                  enter={{ opacity: 1, left: 0 }}
                  leave={{
                    opacity: 0,
                    left: currentTab >= previousTab ? 256 : -256,
                  }}>
                  {item => props => (
                    <animated.div style={props}>{item}</animated.div>
                  )}
                </Transition>
              </GridCell>
            </Grid>
          );
        }}
      </Query>
    );
  }
}
export default Settings;
