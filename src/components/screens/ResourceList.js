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
import { Card, CardAction, CardActions, CardActionIcons } from '@rmwc/card';
import { Checkbox } from '@rmwc/checkbox';
import { Typography } from '@rmwc/typography';
import { Button, ButtonIcon } from '@rmwc/button';
import { IconButton } from '@rmwc/icon-button';
import { Query, Mutation } from 'react-apollo';
import Imgix from 'react-imgix';
import { Helmet } from 'react-helmet';
import { Chip, ChipSet } from '@rmwc/chip';

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

import { Subscribe, ResourcesContainer } from '../../state';
import { remote } from '../../graphs';
import { getType, isSubObject } from '../../providers/GraphqlProvider';
// import { DefaultLayout } from '../layouts';
import Text from '../ui/Text';
import { Select } from 'rmwc';
// import Placeholder from '../ui/Placeholder';

const FabActions = styled('div')`
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  button:not(:last-child) {
    margin-right: 1rem;
  }
`;
const StyledDataTable = styled(DataTable)`
  width: 100%;
  border-left: none;
  border-right: none;
  table {
    width: 100%;
  }
`;
const SmallChip = styled(Chip)`
  font-size: 0.75rem;
`;
const CardHeader = styled(Typography).attrs({
  use: 'headline6',
})`
  margin: 1rem 1.5rem;
`;
const Pagination = styled(CardActions)`
  justify-content: flex-end;
`;
const PaginationRows = styled(Typography).attrs({
  use: 'caption',
  tag: 'div',
})``;
const PaginationSelect = styled(Select)`
  margin: 0 0.5rem;
  font-size: 0.75rem;
  height: 36px;
  transform: rotate(0);
  &:not(.mdc-select--disabled) {
    background: none;
  }
  .mdc-select__native-control {
    height: 36px;
    padding-top: 0;
    padding-bottom: 0;
    font-size: 0.75rem;
    border-bottom: none;
  }
  &.mdc-select--focused .mdc-select__dropdown-icon {
    transform: rotate(180deg);
  }
  .mdc-select__dropdown-icon {
    right: 0.25rem;
    bottom: 0.375rem;
  }
`;
const PaginationIcons = styled(CardActionIcons)`
  margin-left: 0.5rem;
  flex-grow: 0;
`;
const FabActionsSpacer = styled(GridCell)`
  height: 64px;
`;

class ResourceList extends PureComponent {
  state = {
    sortKey: 'createdAt',
    sortDir: 1,
    active: null,
    dialog: { open: false, body: null },
    first: 10,
    page: 1,
  };
  componentDidMount() {
    this.handleScrollTop();
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location !== this.props.location) {
      this.handleScrollTop();
    }
  }
  handleScrollTop = () => {
    window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  };
  formatCell = ({ item, field, type, reference, important = false }) => {
    const value = get(item, field.name);
    if (value === undefined) {
      throw new Error('Invalid source, check config.');
    }
    if (type === 'Image') {
      return (
        <Imgix
          src={value}
          width={80}
          height={72}
          htmlAttributes={{ style: { verticalAlign: 'bottom' } }}
        />
      );
    }
    if (type === 'Boolean') {
      return <Checkbox checked={value} disabled />;
    }
    if (type === 'DateTime') {
      const date = DateTime.fromISO(value);
      return date.isValid ? date.toLocaleString() : 'Error:' + value;
    }
    if (type === 'ENUM') {
      return (
        <ChipSet>
          <SmallChip text={value} />
        </ChipSet>
      );
    }
    if (type === 'String') {
      return (
        <Text use={important ? 'subtitle2' : 'body2'}>
          {truncate(value.toString(), { length: 20 })}
        </Text>
      );
    }
    if (isSubObject(field)) {
      const referenceObject = get(item, field.name);
      const referenceValue =
        value[reference] || value.name || value.title || value.id;
      return (
        <Button
          dense
          tag={Link}
          to={`/edit/${camelCase(type)}/${referenceObject.id}`}>
          <ButtonIcon icon="link" />
          {truncate(referenceValue, { length: 20 })}
        </Button>
      );
    }
  };
  render() {
    const { sortKey, sortDir, first, page } = this.state;
    const { resource: resourceParam } = this.props;
    // Format orderBy
    const orderBy =
      sortDir < 0 ? `${sortKey}_ASC` : sortDir > 0 ? `${sortKey}_DESC` : null;
    const canBeDeleted = has(
      remote.mutation,
      `delete${capitalize(singular(resourceParam))}`
    );
    const queryName = `${camelCase(resourceParam)}Connection`;
    return (
      <Grid>
        <Helmet title={`List ${capitalize(resourceParam)}`} />
        <GridCell span={12}>
          <Subscribe to={[ResourcesContainer]}>
            {({ state: { resources } }) => (
              <Query
                fetchPolicy="cache-and-network"
                query={remote.query[queryName]}
                variables={{ orderBy, first, skip: page * first - first }}>
                {({ data, refetch, error }) => {
                  if (error) return <pre>{error.toString()}</pre>;
                  if (!data[queryName]) return null;

                  const total = data[queryName].aggregate.count;
                  const start = page * first - first;
                  const end = Math.min(start + first, total);

                  const resource = resources.find(
                    r => r.type === singular(capitalize(resourceParam))
                  );
                  const schemaFields = remote.schema.types.find(
                    type => type.name === capitalize(resource.type)
                  ).fields;

                  const items = data[queryName].edges
                    .map(e => e.node)
                    .map(node => omit(node, '__typename'));

                  if (!items.length) {
                    return <p>No results!</p>;
                  }

                  return (
                    <Card>
                      <CardHeader>{capitalize(resourceParam)}</CardHeader>
                      <StyledDataTable>
                        <DataTableContent>
                          <DataTableHead>
                            <DataTableRow>
                              {resource.list.fields.map((field, i) => {
                                const sortable =
                                  field.source.indexOf('.') === -1;
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
                                    navigate(
                                      `/edit/${singular(resourceParam)}/${
                                        item.id
                                      }`
                                    );
                                  }}
                                  onClick={() => {
                                    this.setState({ active: idx });
                                  }}>
                                  {resource.list.fields.map(
                                    (field, fieldIdx) => {
                                      const schemaField = schemaFields.find(
                                        f => f.name === field.source
                                      );
                                      const name = schemaField.name;
                                      const typeName = getType(schemaField)
                                        .name;
                                      const typeKind = schemaField.type.kind;
                                      const type = field.type
                                        ? field.type
                                        : typeKind === 'ENUM'
                                        ? typeKind
                                        : typeName;

                                      const isImage = field.type === 'Image';

                                      return (
                                        <DataTableCell
                                          key={name}
                                          style={{
                                            padding: isImage ? 0 : null,
                                          }}>
                                          {this.formatCell({
                                            item: items[idx],
                                            field: schemaField,
                                            type: type,
                                            reference: field.reference,
                                            important: fieldIdx === 0,
                                          })}
                                        </DataTableCell>
                                      );
                                    }
                                  )}
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
                                        onError={error => window.alert(error)}
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
                      </StyledDataTable>
                      <Pagination>
                        <PaginationRows>Rows per page:</PaginationRows>
                        <PaginationSelect
                          onChange={evt => {
                            this.setState({
                              first: parseInt(evt.target.value, 10),
                            });
                          }}
                          value={first}
                          options={[
                            { label: 5, value: 5 },
                            { label: 10, value: 10 },
                            { label: 25, value: 25 },
                            { label: 50, value: 50 },
                          ]}
                        />
                        <Typography use="caption" tag="div" style={{}}>
                          {start}-{end} of {total}
                        </Typography>
                        <PaginationIcons>
                          <CardAction
                            icon="chevron_left"
                            disabled={page < 2}
                            onClick={() => this.setState({ page: page - 1 })}
                          />
                          <CardAction
                            icon="chevron_right"
                            disabled={page * first > total - 1}
                            onClick={() => this.setState({ page: page + 1 })}
                          />
                        </PaginationIcons>
                      </Pagination>
                    </Card>
                  );
                }}
              </Query>
            )}
          </Subscribe>
          <SimpleDialog
            title="Confirm Delete"
            body={this.state.dialog.body}
            open={this.state.dialog.open}
            onClose={evt => {
              console.log(evt.detail.action);
              this.setState({ dialog: { open: false } });
            }}
          />
        </GridCell>
        <FabActions>
          <Fab
            icon="add"
            type="button"
            onClick={() => {
              navigate(`/edit/${singular(resourceParam)}/new`);
            }}
          />
        </FabActions>
        <FabActionsSpacer />
      </Grid>
    );
  }
}
export default ResourceList;
