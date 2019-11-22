const R = require('ramda')

const checkResponse = (resp) => {
  if(!resp.ok){throw Error(resp.statusText);}
  return resp
}

const initializeResults = runID => (dispatch, getState) => {
  dispatch({
    type: 'TOGGLE_LOADING_RESULTS',
    payload: {"loading": true}
  })
  return Promise.all([
    fetch(`/metadata/plots/${runID}`),
    fetch(`/metadata/groups/${runID}`) 
  ]).then(
    R.map(checkResponse)
   ).then(
    ([plotsResp, groupsResp]) => {
      return Promise.all([
        plotsResp.json(), groupsResp.json()
      ])
    }
  ).then(
    ([{plots}, {groups}]) => {
      dispatch({
        type: 'INITIALIZE_RESULTS',
        payload: {plots, groups}
      })
      return 
    }
  ).catch(
    error => {
      console.log(error)
      dispatch({
        type: 'INITIALIZE_RESULTS',
        payload: {plots: [], groups: []}
      })
    }
  ).finally(
    dispatch({
      type: 'TOGGLE_LOADING_RESULTS',
      payload: {loading: false}
    })
  )    
}

export default {
  initializeResults
}