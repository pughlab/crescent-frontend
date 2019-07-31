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
    addUser: async (
      parent,
      {firstName, lastName, email, password},
      {Users}
    ) => {
      const newUser = await Users.create({firstName, lastName, email, password})
      return newUser
    }
  },
  // We also resolve subfields on our type definitions
  User: {
    // Concatenate first and last name
    name: async ({firstName, lastName}, variables, context) => {
      return firstName + ' ' + lastName
    }
  }
}

module.exports = resolvers