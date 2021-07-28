const { gql } = require('apollo-server')

const typeDefs = gql`
  type Dataset {
    datasetID: ID!
    name: String!
    hasMetadata: Boolean!
    size: Int!
    numGenes: Int
    numCells: Int
    # Ontology tagging
    cancerTag: String
    oncotreeCode: String
    customTags: [String]
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
      datasetID: ID!
    ): Dataset

    tagDataset(
      datasetID: ID!
      cancerTag: String
      oncotreeCode: String
    ): Dataset

    uploadDatasetMetadata(
      datasetID: ID!
      metadata: Upload!
    ): Dataset

    addCustomTagDataset(
      datasetID: ID!
      customTag: String
    ): Dataset

    removeCustomTagDataset(
      datasetID: ID!
      customTag: String
    ): Dataset
  }
`

module.exports = typeDefs