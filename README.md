# prisma-cms

THIS IS A WORK-IN-PROGRESS!
(you will need to tinker with it)

I built this as a proof of concept and for a more prisma-centric "react-admin". If this works out well, I may choose to support it long-term, as Prisma is an excellent database API but with no real open-source CMS.

The goal is to provide a CMS to connect to YOUR server, which in turn communicates with Prisma. As per Prisma's suggestions you should never expose your Prisma database directly to the client. Right now this CMS expects your server's GraphQL API to follow OpenCRUD standards, like Prisma does.

![](https://github.com/danielmahon/prisma-cms/blob/master/public/screenshot.png)

## Current Requirements

- Remote GraphQL Server (like `graphql-yoga`)
  - Must be [OpenCRUD](https://github.com/opencrud/opencrud) compliant and contain required mutations and queries for each "Resource" type
  - Can communicate with your remote Prisma Server
  - Prisma datamodel must include a `User` type with `email` and `password` fields
- IMGIX Account (eventually optional)
- Probably More... (this is a work-in-progress afterall)

## Install

```
yarn add prisma-cms
```

## Usage (example)

Create a new app with `create-react-app`

```
yarn create react-app my-app
cd my-app
```

In `src/index.js` replace the `App` import from `./App.js` to `prisma-cms`

```js
// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from 'prisma-cms';
import './index.css';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
```

Setup the required ENV variables in `.env`

```
REACT_APP_GRAPHQL_ENDPOINT="https://localhost:5002"
REACT_APP_IMGIX_ENDPOINT="YOUR_IMGIX_ENDPOINT"
PORT=5001
BROWSER=false
NODE_ENV=development
```

Run your app in development mode.

```
yarn start
```

That's it! 🎉

(Until the configuration is opened up)

### Optional

Setup local SSL development using https://github.com/cameronhunter/local-ssl-proxy

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
