import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {createUploadLink} from 'apollo-upload-client'

require('dotenv').config()
console.log(process.env.REACT_APP_GRAPHENE_URL_DEV)

// TODO :prod url
const link = createUploadLink({uri: process.env.NODE_ENV === 'development' ? process.env.REACT_APP_GRAPHENE_URL_DEV : process.env.REACT_APP_GRAPHENE_URL_PROD})

export const grapheneClient = new ApolloClient({
  cache: new InMemoryCache(),
  link
})