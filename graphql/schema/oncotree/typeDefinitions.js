const { gql } = require('apollo-server')

// TYPE DEFINITIONS define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  scalar OncotreeCode

  type OncotreeTumourType {
    code: OncotreeCode
    name: String
    children: [OncotreeTumourType]
  }

  # This defines a node in our data graph
  type OncotreeTissue {
    code: OncotreeCode
    name: String
    children: [OncotreeTumourType]
  }

  type Oncotree {
    version: String
    tissue: [OncotreeTissue]
  }

  type Query {
    oncotree: Oncotree
  }

`

module.exports = typeDefs