require('dotenv').config();
const mongooseConnection = require('../database/mongo')

const apolloServer = require('./server')


mongooseConnection.connection.once(
  'open',
  () => {
    // Launch
    apolloServer
      .listen({port: process.env.GRAPHQL_PORT})
      .then(({url}) => console.log(`🚀  Server ready at ${url}`))
  }
)
mongooseConnection.connect('mongodb://mongo/crescent', {useNewUrlParser: true})
