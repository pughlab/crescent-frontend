const setAnnotationsService = ({service}) => ({
  type: 'annotations/setAnnotationsService',
  payload: {
    service
  }
})

export {
  setAnnotationsService
}