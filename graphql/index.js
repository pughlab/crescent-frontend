const mongooseConnection = require('../database/mongo')

const apolloServer = require('./server')


mongooseConnection.connection.once(
  'open',
  () => {
    // Launch
    apolloServer
      .listen({port: 5000})
      .then(({url}) => console.log(`🚀  Server ready at ${url}`))
  }
)
mongooseConnection.connect('mongodb://mongo/crescent', {useNewUrlParser: true})
