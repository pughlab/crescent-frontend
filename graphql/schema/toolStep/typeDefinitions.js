const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar ToolParameterInput
  # Used for updating run parameter values
  scalar ToolParameterValue

  type ToolParameter {
    step: String
    parameter: String
    label: String
    prompt: String
    description: String
    input: ToolParameterInput
    disabled: Boolean
    singleDataset: Boolean
    multiDataset: Boolean
  }

  type ToolStep {
    step: String
    label: String
    parameters: [ToolParameter]
  }

  type Query {
    toolSteps: [ToolStep]
    toolParameter(parameter: String): ToolParameter
  }
  
  # type Mutation {
    
  # }
`

module.exports = typeDefs