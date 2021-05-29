const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const cors = require('cors')
const { mergeTypes, mergeResolvers } = require('merge-graphql-schemas')

const R = require('ramda')
const fs = require('fs')
const session = require('express-session')


const { KeycloakContext, KeycloakTypeDefs, KeycloakSchemaDirectives } = require('keycloak-connect-graphql')
const Keycloak = require('keycloak-connect')

const Models = require('../database/mongo');

const neo4jDriver = require('./neo4j')

// VOYAGER
const { express: voyagerMiddleware } = require('graphql-voyager/middleware')


// GRAPHQL SCHEMAS
const UserSchema = require('./schema/user')
const ProjectSchema = require('./schema/project')
const RunSchema = require('./schema/run')
const DatasetSchema = require('./schema/dataset')
const OncotreeSchema = require('./schema/oncotree')
const ToolStepSchema = require('./schema/toolStep')

const schemas = [UserSchema, ProjectSchema, RunSchema, DatasetSchema, OncotreeSchema, ToolStepSchema]

const Minio = require('./minio')
const WesModule = require('./WesAPI')
const Docker = require('./docker.js')


const app = express()

const graphqlPath = '/graphql'

const keycloakConfig = JSON.parse(fs.readFileSync('/usr/src/app/keycloak.json'))
const memoryStore = new session.MemoryStore()
app.use(session({
  secret: process.env.SESSION_SECRET_STRING || 'this should be a long secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}))

const keycloak = new Keycloak({store: memoryStore}, keycloakConfig)

app.use(keycloak.middleware({admin: graphqlPath}))
app.use(graphqlPath, keycloak.middleware())
app.use(graphqlPath, keycloak.protect())

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   credentials: true // <-- REQUIRED backend setting
// }
// app.use(cors(corsOptions));

app.use(cors());
app.options('*', cors());

// GQL server requires type definitions and resolvers for those types
const server = new ApolloServer({
  typeDefs: R.compose(mergeTypes, R.append(KeycloakTypeDefs), R.map(R.prop('typeDefinitions')))(schemas),
  resolvers: R.compose(mergeResolvers, R.map(R.prop('resolvers')))(schemas),
  schemaDirectives: KeycloakSchemaDirectives,
  dataSources: () => {
    return {
      wesAPI: new WesModule.WesAPI(),
    }
  },
  context: ({req}) => {
    return {
      // TODO: use DataSource rather than putting connection into context
      // Data models can be provided in context...
      Users: Models.User,
      Projects: Models.Project,
      Runs: Models.Run,
      Datasets: Models.Dataset,
      ToolSteps: Models.ToolStep,

      // MINIO
      Minio,
      Docker,

      // KEYCLOAK
      kauth: new KeycloakContext({ req }),

      // NEO4J
      neo4j: {driver: neo4jDriver}
    }
  }
})

app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }));

server.applyMiddleware({ 
  app,
  // cors: false
})

module.exports = app