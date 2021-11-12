import * as R from 'ramda'

const resetAnnotations = R.always({type: 'annotations/reset'})

const setAnnotationsRunID = ({runID}) => ({
  type: 'annotations/setAnnotationsRunID',
  payload: {
    runID
  }
})

const setGenesetUploaded = ({uploaded}) => ({
  type: 'annotations/setGenesetUploaded',
  payload: {
    uploaded
  }
})

const setLogsAvailable = ({logsIsAvailable}) => ({
  type: 'annotations/setLogsAvailable',
  payload: {
    logsIsAvailable
  }
})

const setMetadataUploaded = ({uploaded}) => ({
  type: 'annotations/setMetadataUploaded',
  payload: {
    uploaded
  }
})

const setSecondaryRun = ({secondaryRunWesID}) => ({
  type: 'annotations/setSecondaryRun',
  payload: {
    secondaryRunWesID
  }
})

export {
  resetAnnotations,
  setAnnotationsRunID,
  setGenesetUploaded,
  setLogsAvailable,
  setMetadataUploaded,
  setSecondaryRun
}