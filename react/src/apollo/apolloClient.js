import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {createUploadLink} from 'apollo-upload-client'
import { setContext } from '@apollo/client/link/context';

require('dotenv').config()

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('keycloak_token');
  // return the headers to the context so httpLink can read them
  console.log('SETTING CONTEXT WITH KC TOKEN', token)
  return {
    headers: {
      ...headers,
      // 'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Credentials': true,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
})
const uploadLink = createUploadLink({
  uri: process.env.NODE_ENV === 'development' ? process.env.REACT_APP_GRAPHQL_URL_DEV : process.env.REACT_APP_GRAPHQL_URL_PROD
})

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(uploadLink),
})