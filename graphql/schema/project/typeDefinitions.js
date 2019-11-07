const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar Date
  type Project {
    projectID: ID
    kind: String #'uploaded', 'curated'
    name: String
    description: String
    members: [User]
    createdBy: User
    createdOn: Date

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

    addUserToProject(
      userID: ID
      projectID: ID
    ): Project
  }
`

module.exports = typeDefs