require('dotenv').config()
const mongooseConnection = require('mongoose').connection
const {ToolStep} = require('../database/mongo')
const app = require('./server')

// For loading seurat tool info into mongo
const R = require('ramda')
const TOOLS = require('./TOOLS')
const seuratToolSteps = R.compose(R.flatten, R.pluck('parameters'), R.prop('SEURAT'))(TOOLS)



// Load SEURAT tool steps into database then start GQL server
mongooseConnection.once('open', () => {
  const loadSeuratPromise = new Promise((resolve, reject) => {
    ToolStep.deleteMany({}, (err) => {
      ToolStep.collection.insertMany(seuratToolSteps, (err, docs) => {
        if (err) {
          reject()
        } else {
          console.log('Loaded SEURAT tool details')
          resolve(docs) 
        }
      })
    })
  })

  loadSeuratPromise.then(
    () => app.listen({ port: process.env.GRAPHQL_PORT }, () => console.log(`🚀  Server ready at ${process.env.GRAPHQL_PORT}`)) 
    // () => apolloServer
    //   .listen({ port: process.env.GRAPHQL_PORT })
    //   .then(({ url }) => console.log(`🚀  Server ready at ${url}`))
  )
})
