const R = require("ramda");

const checkResponse = resp => {
    if (!resp.ok) {
        throw Error(resp.statusText);
    }
    return resp;
};

const changeActiveGroup = newGroup => (dispatch, getState) => {
    return dispatch({
        type: "CHANGE_ACTIVE_GROUP",
        payload: { group: newGroup }
    });
};

const fetchEndpoint = endpoint => {
    return fetch(endpoint)
        .then(checkResponse)
        .then(resp => resp.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
            return [];
        });
};

// uses the parameters in the store to fetch the scatter data
const fetchScatter = () => (dispatch, getState) => {
    const {
        app: {
            run: { runID },
            toggle: {
                vis: {
                    results: { activeResult, selectedGroup, selectedFeature }
                }
            }
        }
    } = getState();
    if (R.isNil(selectedFeature) || R.isEmpty(selectedFeature)) {
        return fetchEndpoint(`/scatter/${activeResult}/${selectedGroup}/${runID}`);
    } else {
        return fetchEndpoint(`/opacity/${selectedGroup}/${selectedFeature}/${runID}`);
    }
};

const clearResults = () => (dispatch, getState) => {
    dispatch({
        type: "CLEAR_RESULTS",
        payload: {}
    });
};

const initializeResults = runID => (dispatch, getState) => {
    dispatch({
        type: "TOGGLE_LOADING_RESULTS",
        payload: { loading: true }
    });
    return Promise.all([fetch(`/metadata/plots/${runID}`), fetch(`/metadata/groups/${runID}`)])
        .then(R.map(checkResponse))
        .then(([plotsResp, groupsResp]) => {
            return Promise.all([plotsResp.json(), groupsResp.json()]);
        })
        .then(([{ plots }, { groups }]) => {
            return dispatch({
                type: "INITIALIZE_RESULTS",
                payload: { plots, groups }
            });
        })
        .catch(error => {
            console.log(error);
            dispatch({
                type: "INITIALIZE_RESULTS",
                payload: { plots: [], groups: [] }
            });
        })
        .finally(
            dispatch({
                type: "TOGGLE_LOADING_RESULTS",
                payload: { loading: false }
            })
        );
};

const changeFeatureSearch = searchQuery => (dispatch, getState) => {
    const {
        app: {
            run: { runID }
        }
    } = getState();
    return fetch(`/search/${searchQuery}/${runID}`)
        .then(checkResponse)
        .then(resp => resp.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
            return [];
        });
};

const changeSelectedFeature = feature => (dispatch, getState) => {
    return dispatch({
        type: "CHANGE_SELECTED_FEATURE",
        payload: { feature: feature }
    });
};

export default {
    initializeResults,
    clearResults,
    changeActiveGroup,
    changeFeatureSearch,
    changeSelectedFeature,
    fetchScatter
};

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
