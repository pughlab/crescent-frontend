const mongooseConnection = require('../database/mongo')

const apolloServer = require('./server')


mongooseConnection.connection.once(
  'open',
  () => {
    console.log('MongoDB connected')
    // Launch
    apolloServer
      .listen()
      .then(({url}) => console.log(`🚀  Server ready at ${url}`))
  }
)
mongooseConnection.connect('mongodb://localhost/test', {useNewUrlParser: true})
