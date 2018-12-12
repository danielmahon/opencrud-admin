import React from 'react';
import { navigate } from '@reach/router';
import { Card, CardAction, CardActions } from '@rmwc/card';
import { ListDivider } from '@rmwc/list';
import { Icon } from '@rmwc/icon';
import { Typography } from '@rmwc/typography';
import { Query } from 'react-apollo';
import { Transition, animated } from 'react-spring';
import { plural } from 'pluralize';

import { remote } from '../../../graphs';

const DashboardCard = ({ resource }) => {
  const queryName = `${plural(resource.type.toLowerCase())}Connection`;

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
                          {count} {plural(resource.type)}
                        </Typography>
                        <Typography
                          use="body1"
                          tag="p"
                          theme="text-secondary-on-background">
                          {resource.description}
                        </Typography>
                      </div>
                      <ListDivider />
                      <CardActions fullBleed style={{ minHeight: 0 }}>
                        <CardAction
                          onClick={() =>
                            navigate(
                              `/list/${plural(resource.type).toLowerCase()}`
                            )
                          }>
                          View all {plural(resource.type)}{' '}
                          <Icon icon="arrow_forward" />
                        </CardAction>
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
