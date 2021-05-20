import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';


import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {createUploadLink} from 'apollo-upload-client'
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/react-hooks'

import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'

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

// const client = new ApolloClient({
//   uri: process.env.NODE_ENV === 'development'
//     ? process.env.REACT_APP_GRAPHQL_URL_DEV
//     : process.env.REACT_APP_GRAPHQL_URL_PROD
// })


const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('keycloak_token');
  // return the headers to the context so httpLink can read them
  console.log('SETTING CONTEXT WITH KC TOKEN', token)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "need a token",
    }
  }
})
const uploadLink = createUploadLink({uri: process.env.NODE_ENV === 'development'
? process.env.REACT_APP_GRAPHQL_URL_DEV
: process.env.REACT_APP_GRAPHQL_URL_PROD})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(uploadLink),
  
})

// For dev
// persistor.purge()

const eventLogger = (event, error) => {
  console.log('onKeycloakEvent', event, error)
}

const tokenLogger = (tokens) => {
  console.log('onKeycloakTokens', tokens)
  const {token} = tokens
  localStorage.setItem('keycloak_token', token)
}


ReactDOM.render(
  <ReactKeycloakProvider
    authClient={keycloak}
    onEvent={eventLogger}
    onTokens={tokenLogger}
    initOptions={{ 
      onLoad: "login-required",
    }}
    LoadingComponent={<>Redirecting to Keycloak</>}
  >
    <ReduxProvider store={store}>
      <PersistGate loading={null} {...{persistor}}>
      <ApolloProvider client={client}>
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
