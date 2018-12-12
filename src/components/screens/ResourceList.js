import React, { PureComponent, Fragment } from 'react';
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
import { Icon } from '@rmwc/icon';
import { IconButton } from '@rmwc/icon-button';
import { Query, Mutation } from 'react-apollo';
import Imgix from 'react-imgix';
import { Helmet } from 'react-helmet';
import { Chip, ChipSet } from '@rmwc/chip';
import { Transition, animated } from 'react-spring';

import {
  truncate,
  startCase,
  capitalize,
  camelCase,
  omit,
  get,
  union,
  without,
} from 'lodash';
import { DateTime } from 'luxon';
import { singular } from 'pluralize';
import styled from 'styled-components';

import { Subscribe, SettingsState } from '../../state';
import { remote } from '../../graphs';
import { getType, isSubObject } from '../../providers/GraphqlProvider';
import Text from '../ui/Text';
import { Select } from 'rmwc';

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
const CardHeaderTitle = styled(Typography).attrs({
  use: 'headline6',
  tag: 'div',
})`
  flex: 1;
  line-height: 3rem;
`;
const CardHeaderButtons = styled('div')`
  flex: none;
`;
const CardHeader = styled('div')`
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
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
const AnimatedIconButton = styled(IconButton)`
  &&&::before {
    top: 25%;
    left: 25%;
    width: 50%;
    height: 50%;
  }
`;

class ResourceList extends PureComponent {
  state = {
    sortKey: 'createdAt',
    sortDir: 1,
    active: null,
    dialog: { open: false, body: null },
    first: 10,
    page: 1,
    selected: [],
  };
  componentDidMount() {
    this.handleScrollTop();
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location !== this.props.location) {
      this.handleScrollTop();
    }
  }
  handleSelectItem = id => {
    if (this.state.selected.includes(id)) {
      this.setState({ selected: without(this.state.selected, id) });
    } else {
      this.setState({ selected: union(this.state.selected, [id]) });
    }
  };
  handleSelectAll = items => {
    this.setState({
      selected: this.state.selected.length ? [] : items.map(i => i.id),
    });
  };
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
      return (
        <Icon
          icon={value ? 'check' : 'close'}
          style={{ color: !value && 'var(--mdc-theme-text-icon-on-light)' }}
        />
      );
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
    const { sortKey, sortDir, first, page, selected } = this.state;
    const { resource: resourceParam } = this.props;
    // Format orderBy
    const orderBy =
      sortDir < 0 ? `${sortKey}_ASC` : sortDir > 0 ? `${sortKey}_DESC` : null;
    const queryName = `${camelCase(resourceParam)}Connection`;
    return (
      <Grid>
        <Helmet title={`List ${capitalize(resourceParam)}`} />
        <Subscribe to={[SettingsState]}>
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
                  <Fragment>
                    <GridCell span={12}>
                      <Card>
                        <CardHeader>
                          <CardHeaderTitle>
                            {capitalize(resourceParam)}
                          </CardHeaderTitle>
                          <CardHeaderButtons>
                            <Mutation
                              mutation={
                                remote.mutation[
                                  `deleteMany${capitalize(resourceParam)}`
                                ]
                              }
                              onError={error => {
                                this.setState({ selected: [] });
                                window.alert(error);
                              }}
                              onCompleted={() => {
                                this.setState({ selected: [] });
                                refetch();
                              }}
                              variables={{
                                where: { id_in: selected },
                              }}>
                              {handleDelete => (
                                <Transition
                                  native
                                  config={{ tension: 170 * 2 }}
                                  items={selected.length > 0}
                                  from={{
                                    opacity: 0,
                                    transform: 'scale(0.5)',
                                  }}
                                  enter={{ opacity: 1, transform: 'scale(1)' }}
                                  leave={{
                                    opacity: 0,
                                    transform: 'scale(0.5)',
                                  }}>
                                  {show =>
                                    show &&
                                    (props => (
                                      <animated.div style={props}>
                                        <AnimatedIconButton
                                          type="button"
                                          icon="delete"
                                          onClick={handleDelete}
                                        />
                                      </animated.div>
                                    ))
                                  }
                                </Transition>
                              )}
                            </Mutation>
                          </CardHeaderButtons>
                        </CardHeader>
                        <StyledDataTable>
                          <DataTableContent>
                            <DataTableHead>
                              <DataTableRow>
                                <DataTableHeadCell>
                                  <Checkbox
                                    onChange={() => this.handleSelectAll(items)}
                                    checked={selected.length === end - start}
                                  />
                                </DataTableHeadCell>
                                {resource.list.fields.map((field, i) => {
                                  const sortable =
                                    field.source.indexOf('.') === -1;
                                  return (
                                    <DataTableHeadCell
                                      alignStart={i === 0}
                                      alignEnd={i > 0}
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
                              </DataTableRow>
                            </DataTableHead>
                            <DataTableBody>
                              {items.map((item, idx) => {
                                const isSelected = selected.includes(item.id);
                                return (
                                  <DataTableRow
                                    key={item.id}
                                    activated={this.state.active === idx}
                                    selected={isSelected}
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
                                    <DataTableCell>
                                      <Checkbox
                                        onChange={() =>
                                          this.handleSelectItem(item.id)
                                        }
                                        checked={isSelected}
                                      />
                                    </DataTableCell>
                                    {resource.list.fields.map(
                                      (field, fieldIdx) => {
                                        const schemaField = schemaFields.find(
                                          f => f.name === field.source
                                        );
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
                                            key={field.source}
                                            alignStart={fieldIdx === 0}
                                            alignEnd={fieldIdx > 0}
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
                                    <DataTableCell
                                      alignEnd
                                      style={{ width: '1%' }}>
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
                    </GridCell>
                    <GridCell>
                      <Typography
                        use="body2"
                        theme="textHintOnBackground"
                        tag="p">
                        Double click row to edit
                        <br />
                        Select rows to enable "delete" button
                      </Typography>
                    </GridCell>
                  </Fragment>
                );
              }}
            </Query>
          )}
        </Subscribe>
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
