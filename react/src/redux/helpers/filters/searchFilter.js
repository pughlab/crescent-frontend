import * as R from 'ramda'
export default {
  initialState: {
    searchFilter: ''
  },
  
  setSearchFilter: {
    action: R.curry(
      (domain, {value}) => ({
        type: `${domain}/setSearchFilter`,
        payload: {
          value
        }
      })
    ),
    reducer: (state, payload) => {
      const {value} = payload
      return R.evolve({
        searchFilter: R.always(value)
      })(state)
    }
  }
}