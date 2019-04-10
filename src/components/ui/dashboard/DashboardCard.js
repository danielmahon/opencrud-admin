import React from 'react';
import { navigate } from '@reach/router';
import { Card, CardActionButton, CardActions } from '@rmwc/card';
import { ListDivider } from '@rmwc/list';
import { ButtonIcon } from '@rmwc/button';
import { Typography } from '@rmwc/typography';
import { Query } from 'react-apollo';
import { Transition, animated } from 'react-spring/renderprops';
import { plural } from 'pluralize';
import { camelCase, startCase, kebabCase } from 'lodash';
import { remote } from '../../../graphs';

const DashboardCard = ({ resource }) => {
  const queryName = `${plural(camelCase(resource.type))}Connection`;

  return (
    <Query query={remote.query[queryName]} fetchPolicy="cache-and-network">
      {({ data, loading }) => {
        return (
          <Transition
            native
            items={!loading}
            from={{ transform: 'translate3d(0,40px,0)', opacity: 0 }}
            enter={{ transform: 'translate3d(0,0px,0)', opacity: 1 }}
            leave={{ transform: 'translate3d(0,-40px,0)', opacity: 0 }}>
            {show =>
              show &&
              (props => {
                const count = data[queryName].aggregate.count;
                return (
                  <animated.div style={props}>
                    <Card outlined>
                      <div style={{ padding: '1rem' }}>
                        <Typography use="headline5" tag="div">
                          {count}{' '}
                          {count > 1
                            ? plural(startCase(resource.type))
                            : startCase(resource.type)}
                        </Typography>
                        <Typography
                          use="body1"
                          tag="p"
                          theme="textSecondaryOnBackground">
                          {resource.description}
                        </Typography>
                      </div>
                      <ListDivider />
                      <CardActions fullBleed style={{ minHeight: 0 }}>
                        <CardActionButton
                          onClick={() =>
                            navigate(
                              `/list/${plural(kebabCase(resource.type))}`
                            )
                          }>
                          View all {plural(startCase(resource.type))}{' '}
                          <ButtonIcon icon="arrow_forward" />
                        </CardActionButton>
                      </CardActions>
                    </Card>
                  </animated.div>
                );
              })
            }
          </Transition>
        );
      }}
    </Query>
  );
};

export { DashboardCard };
