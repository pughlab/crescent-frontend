const R = require('ramda')
const axios = require('axios')

// RESOLVERS specify how data is retrieved (multiple DBs, APIs, etc...)
// 
// (parent, variables, context) => someDefinedType
//    parent: the query for which this field is being resolved
//    variables: any arguments passed into query
//    context: an object available globally with every query
const resolvers = {
  // For every type definition there is a resolver...
  Query: {
    oncotree: async (parent, variables, context) => {
      const version = "oncotree_latest_stable"
      return {
        version
      }
    },
    oncotreeRawJSON: async (parent, variables, context) => {
      const requestURL = `http://oncotree.mskcc.org/api/tumorTypes/tree`
      const {data: tree} = await axios.get(requestURL)
      return tree
    }
  },
  Mutation: {

  },
  Oncotree: {
    tissue: async ({version}, variables, context) => {
      try {
        const requestURL = `http://oncotree.mskcc.org/api/tumorTypes/search/level/1?version=${version}&exactMatch=true`
        const {data: tissues} = await axios.get(requestURL)
        return tissues
      } catch(error) {
        console.log(error)
      }
    },
  },
  OncotreeTissue: {
    children: async ({level, code}, variables, context) => {
      try {
        const requestURL = `http://oncotree.mskcc.org/api/tumorTypes/search/level/${level+1}?version=oncotree_latest_stable&exactMatch=true`
        const {data: tumourTypes} = await axios.get(requestURL)
        return R.filter(R.propEq('parent', code), tumourTypes)
      } catch(error) {
        console.log(error)
      }
      
    }
  },
  OncotreeTumourType: {
    children: async ({level, code}, variables, context) => {
      try {
        const requestURL = `http://oncotree.mskcc.org/api/tumorTypes/search/level/${level+1}?version=oncotree_latest_stable&exactMatch=true`
        const {data: tumourTypes} = await axios.get(requestURL)
        return R.filter(R.propEq('parent', code), tumourTypes)
      } catch(error) {
        console.log(error)
      }
    }
  }
}

module.exports = resolvers