

const checkResponse = (resp) => {
  if(!resp.ok){throw Error(resp.statusText);}
  return resp
}

const requestAvailableGroups = (runID) => (dispatch) => {
  dispatch({
    type: 'REQUEST_AVAILABLE_GROUPS',
    payload: {"loading": true}
  })

  return fetch(`/metadata/groups/${runID}`)
    .then((resp) => checkResponse(resp))
    .then((resp) => resp.json())
    .then(
      data => {
        dispatch({
          type: 'RECEIVE_AVAILABLE_GROUPS',
          payload: data
      })}
    )
    .catch(err => {
      console.log(err);
      dispatch({
        type: 'RECEIVE_AVAILABLE_GROUPS',
        payload: {groups: []}
      })
    })
    .finally(
      dispatch({
        type: 'REQUEST_AVAILABLE_GROUPS',
        payload: {"loading": false}
      })
    )
}

const requestAvailablePlots = (runID) => (dispatch, getState) => {
  dispatch({
    type: 'REQUEST_AVAILABLE_PLOTS',
    payload: {"loading": true}
  })

  return fetch(`/metadata/plots/${runID}`)
    .then((resp) => checkResponse(resp))
    .then((resp) => resp.json())
    .then(
      data => {
        dispatch({
        type: 'RECEIVE_AVAILABLE_PLOTS',
        payload: data
      })}
    )
    .catch(err => {
      console.log(err);
      // clear stale attributes on error
      dispatch({
        type: 'RECEIVE_AVAILABLE_PLOTS',
        payload: {plots: []}
      })
    })
    .finally(
      // regardless of failure/success, stop loading
      dispatch({
        type: 'REQUEST_AVAILABLE_PLOTS',
        payload: {"loading": false}
      })
    )

  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve('some data')
  //   }, 3000)
  // }).then(
  //   data => {
  //     console.log(data)
  //     dispatch({
  //       type: 'RECEIVE_AVAILABLE_PLOTS',
  //       payload: data
  //     })
  //   }
  // ) 
}

export default {
  requestAvailablePlots,
  requestAvailableGroups
}