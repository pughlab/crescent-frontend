import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import Logo from './components/login/Logo'
import App from './App';
import * as serviceWorker from './serviceWorker';

import { ApolloProvider } from '@apollo/react-hooks'
import {apolloClient} from './apollo/apolloClient'

import { ReactKeycloakProvider } from '@react-keycloak/web'
import {keycloak} from './keycloak/keycloak'
import {
  eventLogger as keycloakEventLogger,
  tokenLogger as keycloakTokenLogger,
  initOptions as keycloakInitOptions
} from './keycloak/providerConfig'


import { Provider as ReduxProvider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'
import rootReducer from './redux/reducers'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { PersistGate } from 'redux-persist/integration/react'
require('dotenv').config()

const persistConfig = {
  key: 'root',
  storage,
}
const persistedReducer = persistReducer(persistConfig, rootReducer)
// Redux store
const store = createStore(
  persistedReducer,
  composeWithDevTools(
    applyMiddleware(thunk)
  )
  // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
const persistor = persistStore(store)

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
