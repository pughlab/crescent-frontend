const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const cors = require('cors')
const { mergeTypes, mergeResolvers } = require('merge-graphql-schemas')

const R = require('ramda')

const { KeycloakContext, KeycloakTypeDefs, KeycloakSchemaDirectives } = require('keycloak-connect-graphql')
const Keycloak = require('keycloak-connect')

const Models = require('../database/mongo');

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
app.use(cors())

const keycloak = new Keycloak({
  url: 'http://localhost:8080/auth',
  realm: 'crescent',
  clientId: 'crescent-server',
  clientSecret: '4e28f97b-2161-48c7-86d3-65db18eb57b4',
  redirectUri: 'http://localhost:3000'
})
app.use('/graphql', keycloak.middleware())

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
      kauth: new KeycloakContext({ req }, keycloak)
    }
  }
})

server.applyMiddleware({ app })

module.exports = app