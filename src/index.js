import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'

import autobahn from 'autobahn'

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
    <ApolloProvider client={client}>
      <App session={session} />
    </ApolloProvider>,
    document.getElementById('root')
  )
}


connection.open()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()