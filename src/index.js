import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import autobahn from 'autobahn'

import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'

import { Provider as ReduxProvider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './redux/reducers'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { PersistGate } from 'redux-persist/integration/react'

const persistConfig = {
  key: 'root',
  storage,
}
const persistedReducer = persistReducer(persistConfig, rootReducer)
// Redux store
const store = createStore(
  persistedReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
const persistor = persistStore(store)

const client = new ApolloClient({
  uri: 'http://127.0.0.1:5000',
})
// ENV CHANGE HERE (comment one out)
// const connection = new autobahn.Connection({url: 'ws://205.189.56.181:4000/', realm: 'realm1'})
const connection = new autobahn.Connection({url: 'ws://127.0.0.1:4000/', realm: 'realm1'})



connection.onopen = function (session) {

  // // 1) subscribe to a topic
  // function onevent(args) {
  //    console.log("Event:", args[0]);
  // }
  // session.subscribe('com.myapp.hello', onevent);
  // // 2) publish an event
  // session.publish('com.myapp.hello', ['Hello, world!']);

  ReactDOM.render(
    <ReduxProvider store={store}>
      <PersistGate loading={null} {...{persistor}}>
      <ApolloProvider client={client}>
        <App session={session} />
      </ApolloProvider>
      </PersistGate>
    </ReduxProvider>,
    document.getElementById('root')
  )
}


connection.open()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()