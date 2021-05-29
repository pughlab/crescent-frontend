import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';

import { ApolloProvider } from '@apollo/react-hooks'
import {apolloClient} from './apollo/apolloClient'

import Logo from './components/login/Logo'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak/keycloak'
import {
  eventLogger as keycloakEventLogger,
  tokenLogger as keycloakTokenLogger,
  initOptions as keycloakInitOptions
} from './keycloak/providerConfig'

import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import configureStore from './redux/configureStore'
require('dotenv').config()

// Redux store
const {store, persistor} = configureStore()
// FOR DEV PURGING REDUX STORE
// persistor.purge()

ReactDOM.render(
  <ReactKeycloakProvider
    authClient={keycloak}
    onEvent={keycloakEventLogger}
    onTokens={keycloakTokenLogger}
    initOptions={keycloakInitOptions}
    LoadingComponent={<Logo />}
  >
    <ReduxProvider store={store}>
      <PersistGate loading={null} {...{persistor}}>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
      
      </PersistGate>
    </ReduxProvider>
  </ReactKeycloakProvider>
  ,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
