

// storing this here as it may be useful for error handling
const checkResponse = (resp) => {
  if(!resp.ok){
    console.log(resp)
    return {plots: []}
  }
  return resp.json()
}

const requestAvailablePlots = (runID) => (dispatch, getState) => {
  dispatch({
    type: 'REQUEST_AVAILABLE_PLOTS',
    payload: {"loading": true}
  })

  return fetch(`/metadata/plots/${runID}`)
    .then((resp) => resp.json())
    .then(
      data => {
        dispatch({
        type: 'RECEIVE_AVAILABLE_PLOTS',
        payload: data
      })}
    )
    .then(
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
  requestAvailablePlots
}