import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';


import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {createUploadLink} from 'apollo-upload-client'

import { ApolloProvider } from '@apollo/react-hooks'

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

const link = createUploadLink({uri: process.env.NODE_ENV === 'development'
? process.env.REACT_APP_GRAPHQL_URL_DEV
: process.env.REACT_APP_GRAPHQL_URL_PROD})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
})

// For dev
//persistor.purge()

ReactDOM.render(
  <ReduxProvider store={store}>
    <PersistGate loading={null} {...{persistor}}>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
    </PersistGate>
  </ReduxProvider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
