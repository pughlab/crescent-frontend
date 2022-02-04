// For secondary runs
const setAnnotationsService = ({service}) => ({
  type: 'machineServices/setAnnotationsService',
  payload: {
    service
  }
})

// For new project creation
const setNewProjectService = ({service}) => ({
  type: 'machineServices/setNewProjectService',
  payload: {
    service
  }
})

export {
  setAnnotationsService,
  setNewProjectService
}