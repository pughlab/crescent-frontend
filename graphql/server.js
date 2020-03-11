const { ApolloServer } = require('apollo-server')

const { mergeTypes, mergeResolvers } = require('merge-graphql-schemas')

const R = require('ramda')

const Models = require('../database/mongo');

// GRAPHQL SCHEMAS
const UserSchema = require('./schema/user')
const ProjectSchema = require('./schema/project')
const RunSchema = require('./schema/run')
const DatasetSchema = require('./schema/dataset')
const OncotreeSchema = require('./schema/oncotree')

const schemas = [UserSchema, ProjectSchema, RunSchema, DatasetSchema, OncotreeSchema]

const minioClient = require('../database/minio-client');

const Minio = require('./minio')

// GQL server requires type definitions and resolvers for those types
const server = new ApolloServer({
  typeDefs: R.compose(
      mergeTypes,
      R.map(R.prop('typeDefinitions'))
    )(schemas),
  resolvers: R.compose(
    mergeResolvers,
    R.map(R.prop('resolvers'))
  )(schemas),
  context: () => {
    return {
      // TODO: use DataSource rather than putting connection into context
      // Data models can be provided in context...
      Users: Models.User,
      Projects: Models.Project,
      Runs: Models.Run,
      Datasets: Models.Dataset,

      // MINIO
      Minio,
      minioClient, //Should be replaced by above

    }
  }
})

module.exports = server