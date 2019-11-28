const R = require('ramda')

const checkResponse = (resp) => {
  if(!resp.ok){throw Error(resp.statusText);}
  return resp
}

const changeActiveGroup = newGroup => (dispatch, getState) => {
  return dispatch({
    type: 'CHANGE_ACTIVE_GROUP',
    payload: {"group": newGroup}
  });
}

//TODO: a thought, all this information is available in the store
// could instead just have a thunk that uses the info in the store
// to return the 'current' view of the data at any point (would replace intialize too)
const updateScatter = ({runID, selectedGroup}) => (dispatch, getState) => {
  const {
    app: {
      toggle: {vis: {results: {activeResult}}}
    }
  } = getState()
  dispatch({
    type: 'TOGGLE_LOADING_ACTIVE_PLOT',
    payload: {"loading": true, "plot": activeResult}
  });
  return fetch(
    `/scatter/${activeResult}/${selectedGroup}/${runID}`
  ).then(checkResponse)
  .then((resp) => resp.json())
  .then((data) => {return data})
  .catch(
    error => {
      console.log(error)
      return []
  })
  .finally(
    dispatch({
      type: 'TOGGLE_LOADING_ACTIVE_PLOT',
      payload: {"loading": false, "plot": activeResult}
    })
  )    


}

const initializeScatter = runID => (dispatch, getState) => {
  const {
    app: {
      toggle: {vis: {results: {activeResult, availableGroups}}}
    }
  } = getState()
  dispatch({
    type: 'TOGGLE_LOADING_ACTIVE_PLOT',
    payload: {"loading": true, "plot": activeResult}
  });
  return fetch(
    `/scatter/${activeResult}/${availableGroups[0]}/${runID}`
    ).then(checkResponse)
    .then((resp) => resp.json())
    .then((data) => {return data})
    .catch(
      error => {
        console.log(error)
        return []
    })
    .finally(
      dispatch({
        type: 'TOGGLE_LOADING_ACTIVE_PLOT',
        payload: {"loading": false, "plot": activeResult}
      })
    )    
}

const clearResults = () => (dispatch, getState) => {
  dispatch({
    type: 'CLEAR_RESULTS',
    payload: {}
  });
}

const initializeResults = runID => (dispatch, getState) => {
  dispatch({
    type: 'TOGGLE_LOADING_RESULTS',
    payload: {"loading": true}
  });
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
      return dispatch({
        type: 'INITIALIZE_RESULTS',
        payload: {plots, groups}
      });
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
  initializeResults,
  clearResults,
  initializeScatter,
  changeActiveGroup,
  updateScatter
}