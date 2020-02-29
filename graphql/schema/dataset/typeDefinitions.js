const { gql } = require('apollo-server')

const typeDefs = gql`
  type Dataset {
    datasetID: ID
    name: String
    hasMetadata: Boolean
    size: Int
  }

  type Query {
    dataset(datasetID: ID): Dataset
  }

  type Mutation {
    createDataset(
      name: String!
      matrix: Upload!
      features: Upload!
      barcodes: Upload!
      metadata: Upload
    ): Dataset

    deleteDataset(
      datasetID: ID
    ): Dataset
  }
`

module.exports = typeDefs