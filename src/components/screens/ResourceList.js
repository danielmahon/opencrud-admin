import React, { PureComponent, Fragment } from 'react';
import { Link, navigate, Redirect } from '@reach/router';
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
import { Query } from 'react-apollo';
import { Helmet } from 'react-helmet';
import { Chip, ChipSet } from '@rmwc/chip';
import { TypeKind } from 'graphql';
import {
  truncate,
  startCase,
  capitalize,
  camelCase,
  omit,
  union,
  without,
} from 'lodash';
import { DateTime } from 'luxon';
import { singular, plural } from 'pluralize';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';
import isRemoteUrl from 'is-absolute-url';
import { Select } from 'rmwc';

import { remote } from '../../graphs';
import { isSubObject } from '../../providers/RemoteGraphProvider';
import Text from '../ui/Text';
import CardHeader from '../ui/list/CardHeader';
import SelectedCardHeader from '../ui/list/SelectedCardHeader';
import ListFileWidget from '../ui/widgets/ListFileWidget';

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
  formatCell = ({ item, fieldConfig, reference }) => {
    let value = item[fieldConfig.name];
    const typeName = fieldConfig.type;
    const type = remote.schema.types.find(({ name }) => name === typeName);
    if (value === undefined) {
      throw new Error('Invalid field config, check configuration.');
    }
    if (value === null) {
      return <Typography theme="textHintOnBackground">none</Typography>;
    }
    if (fieldConfig.widget === 'File') {
      return <ListFileWidget value={value} />;
    }
    if ([TypeKind.OBJECT].includes(type.kind)) {
      const referenceValue =
        value[reference] || value.name || value.title || value.id;
      return (
        <Button
          dense
          tag={Link}
          to={
            referenceValue
              ? `/edit/${camelCase(typeName)}/${value.id}`
              : `/list/${camelCase(plural(typeName))}`
          }>
          <ButtonIcon icon="link" />
          {truncate(referenceValue || plural(typeName), { length: 20 })}
        </Button>
      );
    }
    if (['Json'].includes(typeName)) {
      return <Icon icon="storage" theme="textHintOnBackground" />;
    }
    if (typeName === 'Boolean') {
      return (
        <Icon
          icon={value ? 'check' : 'close'}
          style={{ color: !value && 'var(--mdc-theme-text-icon-on-light)' }}
        />
      );
    }
    if (typeName === 'DateTime') {
      const date = DateTime.fromISO(value);
      return date.isValid ? date.toLocaleString() : 'Error:' + value;
    }
    if (type.kind === TypeKind.ENUM) {
      return (
        <ChipSet>
          <SmallChip text={value} />
        </ChipSet>
      );
    }
    // Return link or text by default
    if (isRemoteUrl(value)) {
      return (
        <Button
          dense
          tag="a"
          href={value}
          target="_blank"
          rel="noreferrer noopener">
          <ButtonIcon icon="launch" />
          {truncate(value.toString(), { length: 20 })}
        </Button>
      );
    }
    return (
      <Text use="body2">{truncate(value.toString(), { length: 20 })}</Text>
    );
  };
  resetSelection = () => {
    this.setState({ selected: [] });
  };
  render() {
    const { sortKey, sortDir, first, page, selected } = this.state;
    const { resourceParam } = this.props;
    // Format orderBy
    const orderBy =
      sortDir < 0 ? `${sortKey}_ASC` : sortDir > 0 ? `${sortKey}_DESC` : null;
    const queryName = `${camelCase(resourceParam)}Connection`;
    if (!remote.query[queryName] || resourceParam === 'modelConfigs')
      return <Redirect to="/404" noThrow />;
    return (
      <Grid>
        <Helmet title={`List ${capitalize(resourceParam)}`} />
        <Query query={remote.query.modelConfigsConnection}>
          {({ data: { modelConfigsConnection } }) => (
            <Query
              fetchPolicy="cache-and-network"
              query={remote.query[queryName]}
              variables={{ orderBy, first, skip: page * first - first }}>
              {({ data, refetch, error }) => {
                if (error) return <pre>{error.toString()}</pre>;
                if (!data[queryName] || !modelConfigsConnection) return null;

                const total = data[queryName].aggregate.count;
                const start = page * first - first;
                const end = Math.min(start + first, total);

                const configs = modelConfigsConnection.edges.map(e => e.node);
                const config = configs.find(
                  r => r.type === singular(capitalize(resourceParam))
                );
                const schemaType = remote.schema.types.find(
                  type => type.name === capitalize(config.type)
                );
                const schemaFields = schemaType.fields;

                const items = data[queryName].edges
                  .map(e => e.node)
                  .map(node => omit(node, '__typename'));

                if (!items.length) {
                  return (
                    <GridCell span={12}>
                      <p>No results!</p>
                    </GridCell>
                  );
                }

                return (
                  <Fragment>
                    <GridCell span={12}>
                      <Card
                        style={{ position: 'relative', overflow: 'hidden' }}>
                        <CardHeader
                          refetch={refetch}
                          resourceParam={resourceParam}
                          selected={selected}
                        />
                        <SelectedCardHeader
                          refetch={refetch}
                          resourceParam={resourceParam}
                          selected={selected}
                          resetSelection={this.resetSelection}
                        />
                        <StyledDataTable>
                          <DataTableContent>
                            <DataTableHead>
                              <DataTableRow>
                                <DataTableHeadCell>
                                  <Checkbox
                                    indeterminate={
                                      selected.length > 0 &&
                                      selected.length < end - start
                                    }
                                    onChange={() => this.handleSelectAll(items)}
                                    checked={selected.length === end - start}
                                  />
                                </DataTableHeadCell>
                                {config.listFields
                                  .filter(({ enabled }) => enabled)
                                  .map((field, i) => {
                                    const schemaField = schemaFields.find(
                                      ({ name }) => name === field.name
                                    );
                                    const sortable = !isSubObject(schemaField);
                                    const label =
                                      field.label || startCase(field.name);
                                    return (
                                      <DataTableHeadCell
                                        alignStart={i === 0}
                                        alignEnd={i > 0}
                                        key={field.name}
                                        sort={
                                          sortable && sortKey === field.name
                                            ? sortDir
                                            : null
                                        }
                                        onSortChange={
                                          sortable
                                            ? direction => {
                                                this.setState({
                                                  sortKey: field.name,
                                                  sortDir: direction,
                                                });
                                              }
                                            : null
                                        }>
                                        <Tooltip
                                          title={field.name}
                                          placement="top">
                                          <Typography use="caption">
                                            {label}
                                          </Typography>
                                        </Tooltip>
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
                                    onDoubleClick={evt => {
                                      evt.preventDefault();
                                      if (
                                        document.selection &&
                                        document.selection.empty
                                      ) {
                                        document.selection.empty();
                                      } else if (window.getSelection) {
                                        window.getSelection().removeAllRanges();
                                      }
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
                                    {config.listFields
                                      .filter(({ enabled }) => enabled)
                                      .map((fieldConfig, fieldIdx) => {
                                        return (
                                          <DataTableCell
                                            key={fieldConfig.name}
                                            alignStart={fieldIdx === 0}
                                            alignEnd={fieldIdx > 0}>
                                            {this.formatCell({
                                              item: items[idx],
                                              fieldConfig: fieldConfig,
                                            })}
                                          </DataTableCell>
                                        );
                                      })}
                                    <DataTableCell
                                      alignEnd
                                      style={{ width: '1%' }}>
                                      <Button
                                        onClick={() => {
                                          navigate(
                                            `/edit/${singular(resourceParam)}/${
                                              item.id
                                            }`
                                          );
                                        }}>
                                        <ButtonIcon icon="edit" />
                                        Edit
                                      </Button>
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
        </Query>
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
