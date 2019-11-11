const R = require('ramda')

// RESOLVERS specify how data is retrieved (multiple DBs, APIs, etc...)
// 
// (parent, variables, context) => someDefinedType
//    parent: the query for which this field is being resolved
//    variables: any arguments passed into query
//    context: an object available globally with every query
const resolvers = {
  // For every type definition there is a resolver...
  Query: {
    users: async (parent, variables, {Users}) => {
      const users = await Users.find({}).lean()
      return users
    }
  },
  Mutation: {
    // These resolvers should do some kind of create/update/delete
    createUser: async (
      parent,
      {firstName, lastName, email, password},
      {Users}
    ) => {
      const newUser = await Users.create({firstName, lastName, email, password})
      return newUser
    },
    authenticateUser: async (
      parent,
      {email, password},
      {Users}
    ) => {
      // Authenticate here
      const user = await Users.findOne({email})
      const passed = R.equals(R.prop('password', user), password)
      if (passed) {
        // Save date as token for now
        user.sessionToken = `${new Date()}`
        await user.save()
      }
      return passed ? user : null
    }
  },
  // We also resolve subfields on our type definitions
  User: {
    // Concatenate first and last name
    name: async ({firstName, lastName}, variables, context) => {
      return firstName + ' ' + lastName
    },
    projects: async ({userID}, variables, {Projects}) => {
      return await Projects.find({
        $or: [{createdBy: userID}, {sharedWith: {$elemMatch: {$eq: userID}}}],
        kind: 'uploaded'
      })
    }
  }
}

module.exports = resolvers