import React, { PureComponent } from 'react';
import { Link, navigate } from '@reach/router';
import { Grid, GridCell } from '@rmwc/grid';
import { Fab } from '@rmwc/fab';
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableBody,
  DataTableHeadCell,
  DataTableRow,
  DataTableCell,
} from '@rmwc/data-table';
import { Checkbox } from '@rmwc/checkbox';
import { Button, ButtonIcon } from '@rmwc/button';
import { IconButton } from '@rmwc/icon-button';
import { Query, Mutation } from 'react-apollo';
import Imgix from 'react-imgix';

import {
  truncate,
  startCase,
  capitalize,
  camelCase,
  omit,
  has,
  get,
} from 'lodash';
// import { CircularProgress } from '@rmwc/circular-progress';
import { DateTime } from 'luxon';
import { singular } from 'pluralize';
import { SimpleDialog } from '@rmwc/dialog';
import styled from 'styled-components';

import { remote } from '../../graphs';
import { DefaultLayout } from '../layouts';
import Text from '../ui/Text';
// import Placeholder from '../ui/Placeholder';

const FabActions = styled('div')`
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  button:not(:last-child) {
    margin-right: 1rem;
  }
`;

class ResourceList extends PureComponent {
  state = {
    sortKey: 'createdAt',
    sortDir: 1,
    active: null,
    dialog: { open: false, body: null },
  };
  formatCell = ({ item, field, important = false }) => {
    const value = get(item, field.source);
    if (value === undefined) {
      throw new Error('Invalid source, check config.');
    }
    switch (field.type.split(':')[0]) {
      case 'Image':
        return (
          <Imgix
            src={value}
            width={80}
            height={72}
            htmlAttributes={{ style: { verticalAlign: 'bottom' } }}
          />
        );
      case 'Boolean':
        return <Checkbox checked={value} disabled />;
      case 'Reference':
        const referenceType = field.type.split(':')[1];
        const referenceObject = get(item, field.source.split('.')[0]);
        return (
          <Button
            dense
            tag={Link}
            to={`/edit/${camelCase(referenceType)}/${referenceObject.id}`}>
            <ButtonIcon icon="link" />
            {value}
          </Button>
        );
      case 'DateTime':
        const date = DateTime.fromISO(value);
        if (date.isValid) {
          return date.toLocaleString();
        }
        break;
      case 'Text':
      default:
        return (
          <Text use={important ? 'subtitle2' : 'body2'}>
            {truncate(value.toString(), { length: 20 })}
          </Text>
        );
    }
  };
  render() {
    const { sortKey, sortDir } = this.state;
    const { resource: resourceParam } = this.props;
    // Format orderBy
    const orderBy =
      sortDir < 0 ? `${sortKey}_ASC` : sortDir > 0 ? `${sortKey}_DESC` : null;
    const canBeDeleted = has(
      remote.mutation,
      `delete${capitalize(singular(resourceParam))}`
    );
    return (
      <DefaultLayout title={`List ${capitalize(resourceParam)}`}>
        <Grid>
          <GridCell span={12}>
            <Query
              fetchPolicy="cache-and-network"
              query={remote.query[resourceParam]}
              variables={{ orderBy }}>
              {({ data, refetch }) => {
                const queryName = `${camelCase(resourceParam)}Connection`;
                if (!data[queryName]) return null;
                const resource = data.resources.find(
                  r => r.type === singular(capitalize(resourceParam))
                );
                const items = data[queryName].edges
                  .map(e => e.node)
                  .map(node => omit(node, '__typename'));
                if (!items.length) {
                  return <p>No results!</p>;
                }
                return (
                  <DataTable style={{ maxWidth: '100%' }}>
                    <DataTableContent>
                      <DataTableHead>
                        <DataTableRow>
                          {resource.list.fields.map((field, i) => {
                            const sortable = field.source.indexOf('.') === -1;
                            return (
                              <DataTableHeadCell
                                alignMiddle
                                key={field.source}
                                sort={
                                  sortable && sortKey === field.source
                                    ? sortDir
                                    : null
                                }
                                onSortChange={
                                  sortable
                                    ? direction => {
                                        this.setState({
                                          sortKey: field.source,
                                          sortDir: direction,
                                        });
                                      }
                                    : null
                                }>
                                {startCase(field.source)}
                              </DataTableHeadCell>
                            );
                          })}
                          <DataTableHeadCell />
                          {canBeDeleted && <DataTableHeadCell />}
                        </DataTableRow>
                      </DataTableHead>
                      <DataTableBody>
                        {items.map((item, idx) => {
                          return (
                            <DataTableRow
                              key={item.id}
                              activated={this.state.active === idx}
                              onDoubleClick={() => {
                                console.log('DOUBLE CLICK');
                                navigate(
                                  `/edit/${singular(resourceParam)}/${item.id}`
                                );
                              }}
                              onClick={() => {
                                this.setState({ active: idx });
                              }}>
                              {resource.list.fields.map((field, fieldIdx) => {
                                const isImage = field.type === 'Image';
                                return (
                                  <DataTableCell
                                    key={field.source}
                                    style={{
                                      padding: isImage ? 0 : null,
                                    }}>
                                    {this.formatCell({
                                      item: items[idx],
                                      field: field,
                                      important: fieldIdx === 0,
                                    })}
                                  </DataTableCell>
                                );
                              })}
                              <DataTableCell>
                                <IconButton
                                  icon="edit"
                                  onClick={() => {
                                    navigate(
                                      `/edit/${singular(resourceParam)}/${
                                        item.id
                                      }`
                                    );
                                  }}
                                />
                              </DataTableCell>
                              {canBeDeleted && (
                                <DataTableCell>
                                  <Mutation
                                    mutation={
                                      remote.mutation[
                                        `delete${capitalize(
                                          singular(resourceParam)
                                        )}`
                                      ]
                                    }
                                    onCompleted={refetch}
                                    variables={{ where: { id: item.id } }}>
                                    {handleDelete => (
                                      <IconButton
                                        type="button"
                                        icon="delete"
                                        onClick={() => {
                                          handleDelete();
                                        }}
                                      />
                                    )}
                                  </Mutation>
                                </DataTableCell>
                              )}
                            </DataTableRow>
                          );
                        })}
                      </DataTableBody>
                    </DataTableContent>
                  </DataTable>
                );
              }}
            </Query>
            <SimpleDialog
              title="Confirm Delete"
              body={this.state.dialog.body}
              open={this.state.dialog.open}
              onClose={evt => {
                console.log(evt.detail.action);
                this.setState({ dialog: { open: false } });
              }}
            />
            <FabActions>
              <Fab
                icon="add"
                type="button"
                onClick={() => {
                  navigate(`/edit/${singular(resourceParam)}/new`);
                }}
              />
            </FabActions>
          </GridCell>
        </Grid>
      </DefaultLayout>
    );
  }
}
export default ResourceList;
