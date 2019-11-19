
const requestAvailabelPlots = (runID) => (dispatch, getState) => {
  dispatch({
    type: 'REQUEST_AVAILABLE_PLOTS'
  })

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

  return fetch(`/metadata/plots/${runID}`)
    .then(
      data => dispatch({
        type: 'RECEIVE_AVAILABLE_PLOTS',
        payload: data.json()
      })
    )

}


export default {
  requestAvailabelPlots
}