const { gql } = require('apollo-server')

const typeDefs = gql`
  type Project {
    projectID: ID
    name: String
    members: [User]
  }
  type Query {
    project(
      projectID: ID
    ): Project
    
    projects(
      userID: ID
    ): [Project]
  }
  type Mutation {
    createProject(
      userID: ID,
      name: String
    ): Project

    addUserToProject(
      userID: ID
      projectID: ID
    ): Project
  }
`

module.exports = typeDefs