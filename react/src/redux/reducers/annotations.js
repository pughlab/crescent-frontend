import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import createReducer from './createReducer'

const initialState = {
  annotationsRunID: null,
  genesetUploaded: null,
  logs: null,
  logsIsAvailable: false,
  logsWasAvailable: false,
  secondaryRunSubmitted: false,
  secondaryRunWesID: null
}

export default createReducer(
  initialState, {
    'annotations/reset': (state, payload) => {
      const {annotationsRunID} = state

      return R.evolve({
        annotationsRunID: R.always(annotationsRunID)
      })(initialState)
    },
    'annotations/setAnnotationsRunID': (state, payload) => {
      const {annotationsRunID} = state
      const {runID} = payload

      return R.equals(annotationsRunID, runID) ? ({
        ...state
      }) : (
        R.evolve({
          annotationsRunID: R.always(runID)
        })(initialState)
      )
    },
    'annotations/setGenesetUploaded': (state, payload) => {
      const {uploaded} = payload

      return R.evolve({
        genesetUploaded: R.always(uploaded)
      })(state)
    },
    'annotations/setLogs': (state, payload) => {
      const {logsIsAvailable: logsIsAvailablePrev, logsWasAvailable: logsWasAvailablePrev} = state
      const {logs} = payload

      const logsIsAvailableCurr = RA.isNotNil(logs)

      return R.evolve({
        logs: R.always(logs),
        logsIsAvailable: R.always(logsIsAvailableCurr),
        logsWasAvailable: R.always(
          R.or(
            logsWasAvailablePrev,
            R.and(
              logsIsAvailablePrev,
              R.not(logsIsAvailableCurr)
            )
          )
        )
      })(state)
    },
    'annotations/setSecondaryRun': (state, payload) => {
      const {secondaryRunWesID} = payload

      return R.evolve({
        secondaryRunSubmitted: R.T,
        secondaryRunWesID: R.always(secondaryRunWesID)
      })(state)
    }
  }
)