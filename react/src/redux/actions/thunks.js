const R = require('ramda')

const checkResponse = (resp) => {
  if(!resp.ok){throw Error(resp.statusText);}
  return resp
}

// re-useable function for fetching and error-checking endpoints
const fetchEndpoint = (endpoint) => {
  return fetch(endpoint)
  .then(checkResponse)
  .then((resp) => resp.json())
  .then((data) => {
    if(R.has('error',data)){
      // specific error from endpoint
      console.log(data['error']);
      return []
    }
    return data
  })
  .catch((error) => {
      console.log(error, endpoint)
      return []
  });
}

const fetchAvailableQC = () => (dispatch, getState) => {
  // get active runID from state
  const {
    app: {run: {runID}}
  } = getState()
  console.log(`/express/available-qc/${runID}`)
  return fetchEndpoint(`/express/available-qc/${runID}`)
}

const changeActiveGroup = newGroup => (dispatch, getState) => {
  return dispatch({
    type: 'CHANGE_ACTIVE_GROUP',
    payload: {"group": newGroup}
  });
}

// uses parameters in the store to fetch opacity data
const fetchOpacity = () => (dispatch, getState) => {
  const {
    app: {
      run: {runID},
      toggle: {vis: {results: {selectedGroup, selectedFeature}}}
    }
  } = getState()
  return fetchEndpoint(`/express/opacity/${selectedGroup}/${selectedFeature}/${runID}`)
}

// uses the parameters in the store to fetch the scatter data
const fetchScatter = () => (dispatch, getState) => {
  const {
    app: {
      run: {runID},
      toggle: {vis: {results: {activeResult, selectedGroup, selectedFeature}}}
    }
  } = getState()
  return fetchEndpoint(`/express/scatter/${activeResult}/${selectedGroup}/${runID}`)
}

// uses paramters in store to fetch violin plot data
const fetchViolin = () => (dispatch, getState) => {
  const {
    app: {
      run: {runID},
      toggle: {vis: {results: {selectedGroup, selectedFeature}}}
    }
  } = getState()
  return fetchEndpoint(`/express/violin/${selectedGroup}/${selectedFeature}/${runID}`)
}

const clearResults = () => (dispatch, getState) => {
  dispatch({
    type: 'CLEAR_RESULTS',
    payload: {}
  });
}

const fetchHeatMap = () => (dispatch, getState) => {
  const {
    app: {
      run: {runID}
    }
  } = getState()
  return fetchEndpoint(`/express/heatmap/${runID}`)
}

const fetchTopExpressed = runID => (dispatch, getState) => {
  fetchEndpoint(`/express/top-expressed/${runID}`).then((result) => {
    dispatch({
      type: 'SET_TOP_EXPRESSED',
      payload: {"features": result}
    });
  });
}

const fetchQC = selectedQC => (dispatch, getState) => {
  const {
    app: {
      run: {runID},
    }
  } = getState()
  return fetchEndpoint(`/express/qc-data/${runID}/${selectedQC}`)
}

const fetchMetrics = runID => (dispatch, getState) => {
  return fetchEndpoint(`/express/metadata/qc_metrics/${runID}`)
}

const initializeResults = runID => (dispatch, getState) => {
  dispatch({
    type: 'TOGGLE_LOADING_RESULTS',
    payload: {"loading": true}
  });
  return Promise.all([
    fetch(`/express/metadata/plots/${runID}`),
    fetch(`/express/metadata/groups/${runID}`) 
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

// some plots can only display categorical labels
// this is a way to ensure that the numeric ones aren't shown
const getCategoricalGroups = runID => (dispatch, getState) => {
  fetchEndpoint(`/express/metadata/categorical_groups/${runID}`).then((result) => {
    dispatch({
      type: 'SET_AVAILABLE_GROUPS',
      payload: result
    })
  })
}

const resetGroups = runID => (dispatch, getState) => {
  fetchEndpoint(`/express/metadata/groups/${runID}`).then((result) => {
    dispatch({
      type: 'SET_AVAILABLE_GROUPS',
      payload: result
    })
  })
}

  /*
    fetch(`/express/metadata/categorical_groups/${runID}`).then((result) => {
    console.log(result)
  })
   /*
  return fetchEndpoint(`/express/metadata/categorical_groups/${runID}`).then((result) => {
    console.log(result)
    dispatch({
      type: 'SET_AVAILABLE_GROUPS',
      payload: {groups: result}
    });
  });
    */

  const changeSelectedFeature = feature => (dispatch, getState) => {
  if (R.isEmpty(feature)){
    feature = null;
  }
  return dispatch({
    type: 'CHANGE_SELECTED_FEATURE',
    payload: {"feature": feature}
  });
}

export default {
  initializeResults,
  clearResults,
  changeActiveGroup,
  changeSelectedFeature,
  fetchScatter,
  fetchOpacity,
  fetchViolin,
  fetchHeatMap,
  fetchTopExpressed,
  fetchQC,
  fetchAvailableQC,
  fetchMetrics,
  getCategoricalGroups,
  resetGroups
}

/* KEEPING THIS HERE FOR REFERENCE IF DECIDE TO TOGGLE LOADING
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
*/
