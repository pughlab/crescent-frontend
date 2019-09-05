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
  }
  type Query {
    project(projectID: ID): Project
    
    uploadedProjects(userID: ID): [Project]

    curatedProjects: [Project]
  }
  type Mutation {
    createProject(
      userID: ID,
      name: String,
      description: String
    ): Project

    addUserToProject(
      userID: ID
      projectID: ID
    ): Project
  }
`

module.exports = typeDefs