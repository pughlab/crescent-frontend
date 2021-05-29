const R = require('ramda')
const passwordGenerator = require('generate-password')

// RESOLVERS specify how data is retrieved (multiple DBs, APIs, etc...)
// 
// (parent, variables, context) => someDefinedType
//    parent: the query for which this field is being resolved
//    variables: any arguments passed into query
//    context: an object available globally with every query
const resolvers = {
  // For every type definition there is a resolver...
  Query: {
    me: async (parent, variables, {kauth}) => {
      try {
        const {sub: userID, email, name, ... kcAuth} = kauth.accessToken.content
        const user = {
          userID,
          email,
          name,
          sessionToken: '',
          projects: [],
        }
        return user
      } catch(err) {
        console.log('me', err)
      }
    },
    users: async (parent, variables, {Users}) => {
      const users = await Users.find({
        firstName: {
          $not: {$eq: 'Anonymous Guest'}
        }
      }).lean()
      return users
    },
    user: async (parent, {userID}, {Users}) => {
      const user  = await Users.findOne({userID})
      return user
    }
  },
  Mutation: {
    me: async (parent, variables, {kauth, neo4j}) => {
      try {


        const {sub: keycloakUserID, email, name, ... kcAuth} = kauth.accessToken.content
        const keycloakUser = { keycloakUserID, email, name }

        const session = driver.session()
        const result = await session.run(
          'CREATE (a:User {keycloakUserID: $keycloakUserID, name: $name, email: $email}) RETURN a',
          keycloakUser
        )
        const singleRecord = result.records[0]
        const node = singleRecord.get(0)
        
        return node
      } catch(err) {
        console.log('mutation.me', err)
      }
    },
    
    // These resolvers should do some kind of create/update/delete
    createGuestUser: async (
      parent,
      variables,
      {Users}
    ) => {
      const [firstName, lastName] = ['Public', 'User']
      const password = passwordGenerator.generate({
        length: 10,
        numbers: true
      })
      const email = R.concat(
        passwordGenerator.generate({
          length: 10,
          numbers: true
        }),
        '@crescent.cloud'
      )
      const guestUser = await Users.create({firstName, lastName, email, password})
      return guestUser

    },
    createUser: async (
      parent,
      {firstName, lastName, email, password},
      {Users}
    ) => {
      const existingUser = await Users.findOne({email})
      if (R.isNil(existingUser)) {
        const newUser = await Users.create({firstName, lastName, email, password})
        return newUser
      } else {
        return null
      }
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
    // name: async ({firstName, lastName}, variables, context) => {
    //   return firstName + ' ' + lastName
    // },
    projects: async ({userID}, variables, {Projects}) => {
      return await Projects.find({
        $or: [{createdBy: userID}, {sharedWith: {$elemMatch: {$eq: userID}}}],
        kind: 'uploaded'
      })
    }
  }
}

module.exports = resolvers