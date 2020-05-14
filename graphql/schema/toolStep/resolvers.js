const R = require('ramda')


// TODO:  expand database and gql layer to {Steps -> Tools -> Parameters}
//        once pipeline builder is implemented
//        ToolSteps mongo model is here as reference for when full pipeline builder
const TOOLS = require('../../TOOLS')

const resolvers = {
  // For every type definition there is a resolver...
  Query: {
    toolSteps: async (parent, variables, context) => {
      try {
        return R.compose(
          R.map(R.pick(['step', 'label'])),
          R.prop('SEURAT')
        )(TOOLS)
      } catch (err) {
        console.log(err)
      }
    },

    toolParameter: async (parent, {parameter}, {ToolSteps}) => {
      try {
        return await ToolSteps.findOne({parameter})
      } catch (err) {
        console.log(err)
      }
    }
  },
  Mutation: {

  },
  ToolStep: {
    parameters: async ({step}, variables, {ToolSteps}) => {
      try {
        return await Promise.all(
          R.compose(
            R.map(parameter => ToolSteps.findOne({parameter})),
            R.pluck('parameter'),
            R.prop('parameters'),
            R.find(R.propEq('step', step)),
            R.prop('SEURAT')
          )(TOOLS)
        ) 
      } catch (err) {
        console.log(err)
      }
    }
  }
}

module.exports = resolvers