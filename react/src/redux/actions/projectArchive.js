import * as R from 'ramda'

const resetAccordionIndices = R.always({type: 'projectArchive/resetAccordionIndices'})

const resetProjectArchive = R.always({type: 'projectArchive/reset'})

const setConfirmArchiveProjectOpen = ({open}) => ({
  type: 'projectArchive/setConfirmArchiveProjectOpen',
  payload: {
    open
  }
})

const setConfirmArchiveRunsOpen = ({open}) => ({
  type: 'projectArchive/setConfirmArchiveRunsOpen',
  payload: {
    open
  }
})

const setProjectArchiveModalOpen = ({open}) => ({
  type: 'projectArchive/setProjectArchiveModalOpen',
  payload: {
    open
  }
})

const setRunSelected = ({runID}) => ({
  type: 'projectArchive/setRunSelected',
  payload: {
    runID
  }
})

const toggleAccordionIndices = ({index}) => ({
  type: 'projectArchive/toggleAccordionIndices',
  payload: {
    index
  }
})

export {
  resetAccordionIndices,
  resetProjectArchive,
  setConfirmArchiveProjectOpen,
  setConfirmArchiveRunsOpen,
  setProjectArchiveModalOpen,
  setRunSelected,
  toggleAccordionIndices
}