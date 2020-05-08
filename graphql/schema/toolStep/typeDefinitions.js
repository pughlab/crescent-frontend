const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar ToolParameterInput

  type ToolParameter {
    parameter: String
    label: String
    prompt: String
    description: String
    input: ToolParameterInput
    disabled: Boolean
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