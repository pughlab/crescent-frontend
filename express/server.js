const submitCWL = require('./submit')

// Servers
const autobahn = require('autobahn')
const connection = new autobahn.Connection({url: 'ws://127.0.0.1:4000/', realm: 'realm1'})
const express = require('express')

// Start autobahn connectio to WAMP router and init node server
connection.onopen = function (session) {
  // Register method to run example
  session
    .register(
      'crescent.submit',
      (args, kwargs) => {
        // console.log(args)
        // console.log(kwargs)
        console.log('RUN YOUR CWL COMMAND HERE')
        submitCWL()
        return 'result of run submission'
      }
    )
    .then(
      reg => console.log('Registered: ', reg.procedure),
      err => console.error('Registration error: ', err)
    )

  // Start node server for HTTP stuff
  const app = express()
  const port = 4001
  const router = express.Router()
  router.get('/', function(req, res, next) {
    res.send('test submit')
  })
  app.get('/', router)
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}


connection.open()