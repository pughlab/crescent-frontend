const { gql } = require('apollo-server')

const typeDefs = gql`
  type Project {
    projectID: ID
    children: [ID]
    dataset: ID
    members: [User]
  }
  type Query {
    project(
      projectID: ID
    ): Project
    projects: [Project]
  }
  type Mutation {
    createProject(
      userID: ID
    ): Project

    addUserToProject(
      userID: ID
      projectID: ID
    ): Project
  }
`

module.exports = typeDefs