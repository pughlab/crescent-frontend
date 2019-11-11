const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar Date
  type Project {
    projectID: ID
    kind: String #'uploaded', 'curated'
    name: String
    description: String
    sharedWith: [User]
    createdBy: User
    createdOn: Date

    archived: Date

    runs: [Run]
  }
  type Query {
    project(projectID: ID): Project

    curatedProjects: [Project]

    projects(userID: ID): [Project]
  }
  type Mutation {
    createProject(
      userID: ID,
      name: String,
      description: String,
      barcodesObjectName: ID!,
      genesObjectName: ID!,
      matrixObjectName: ID!,
    ): Project
    
    # Sets 'sharedWith' property to whatever array of IDs is passed
    shareProject(
      projectID: ID
      sharedWith: [ID]
    ): Project

    # Archive project by setting archive property to a current date
    archiveProject(
      projectID: ID
    ): Project
  }
`

module.exports = typeDefs