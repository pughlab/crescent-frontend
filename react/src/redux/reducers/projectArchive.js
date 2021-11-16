import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import createReducer from './createReducer'

const initialState = {
  accordionIndices: [],
  confirmArchiveProjectOpen: false,
  confirmArchiveRunsOpen: false,
  projectArchiveModalOpen: false,
  selectedRuns: []
}

export default createReducer(
  initialState, {
    'projectArchive/reset': R.always(initialState),
    'projectArchive/resetAccordionIndices': (state) => {
      return R.evolve({
        accordionIndices: RA.stubArray
      })(state)
    },
    'projectArchive/setConfirmArchiveProjectOpen': (state, payload) => {
      const {open} = payload

      return R.evolve({
        confirmArchiveProjectOpen: R.always(open)
      })(state)
    },
    'projectArchive/setConfirmArchiveRunsOpen': (state, payload) => {
      const {open} = payload

      return R.evolve({
        confirmArchiveRunsOpen: R.always(open)
      })(state)
    },
    'projectArchive/setProjectArchiveModalOpen': (state, payload) => {
      const {open} = payload

      return R.evolve({
        projectArchiveModalOpen: R.always(open)
      })(state)
    },
    'projectArchive/setRunSelected': (state, payload) => {
      const {runID} = payload

      return R.evolve({
        selectedRuns: R.ifElse(
          R.includes(runID),
          R.without([runID]),
          R.append(runID)
        )
      })(state)
    },
    'projectArchive/toggleAccordionIndices': (state, payload) => {
      const {index} = payload

      return R.evolve({
        accordionIndices: R.ifElse(
          R.includes(index),
          R.without([index]),
          R.append(index)
        )
      })(state)
    }
  }
)