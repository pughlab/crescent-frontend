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

const setLogs = ({logs}) => ({
  type: 'annotations/setLogs',
  payload: {
    logs
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
  setLogs,
  setSecondaryRun
}