import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// Apollo Client
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'
import { ApolloProvider } from '@apollo/react-hooks'

// Redux
import { configureStore } from '@reduxjs/toolkit'
import { Provider as ReduxProvider } from 'react-redux'
import { persistStore, persistReducer } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import rootReducer from './redux/rootReducer'

require('dotenv').config()

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    'machineServices',
    'projectArchive',
    'resultsPage'
  ]
}
const persistedReducer = persistReducer(persistConfig, rootReducer)
// Redux store
const store = configureStore({
  reducer: persistedReducer,
  // Default middleware include: thunk, immutableStateInvariant, and serializableStateInvariant (disabled)
  // immutableStateInvariant is not applicable when using createSlice as it automatically uses Immer internally
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: false
  }),
  // Set devTools to false to disable Redux DevTools integration
  // devtools: false
})
// Redux store persistor
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
// persistor.purge()

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
