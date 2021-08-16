import {useState, useEffect, useCallback} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { RUN_PARAMETERS, BULK_UPDATE_RUN_PARAMETER_VALUES } from '../../queries/run'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as jsonexport from 'jsonexport/dist'
import * as papaparse from 'papaparse'

export default function useRunParametersDownloadUploadMutation(runID) {
  // Hold GQL run query in local state
  const [run, setRun] = useState(null)
  const {loading, data, error, refetch} = useQuery(RUN_PARAMETERS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 1000,
    variables: {runID},
    onCompleted: ({run}) => {
      setRun(run)
    }
  })
  // GQL mutation to override run.parameter field
  const [bulkUpdateRunParameterValues, {}] = useMutation(BULK_UPDATE_RUN_PARAMETER_VALUES, {
    variables: {runID},
    onCompleted: ({bulkUpdateRunParameterValues: run}) => {
      // Update run in local state
      refetch()
    }
  })
  // Given a non-null run, take qc parameters and export as CSV in browser
  const [templateDownloadLink, setTemplateDownloadLink] = useState(null)
  useEffect(() => {
    if (RA.isNotNil(run)) {
      const {parameters: {quality}, datasets} = run
      jsonexport(
        // Get qc parameters by dataset
        R.map(
          ({datasetID, name}) => ({datasetID, name, ... quality[datasetID]}),
          datasets
        ),
        // Convert qc parameter JSON into CSV and set as download link
        (err, csv) => {
          if (err) {
            return console.log('QC template download error', err)
          } else {
            R.compose(
              setTemplateDownloadLink,
              blob => window.URL.createObjectURL(blob),
              data => new Blob([data], {type: 'text/csv'})
            )(csv)
          }
        }
      )
    }
  }, [run])

  // Dropzone callback for calling mutation on uploaded modified template file
  const onDrop = useCallback(acceptedFiles => {
    if (R.and(RA.isNotNil(run),RA.isNotEmpty(acceptedFiles))) {
      papaparse.parse(acceptedFiles[0], {
        complete: ({data, errors, meta}) => {
          const [headers, ...body] = data
          const headerLens = R.map(R.compose(R.lensPath, R.split('.')), headers)
          const qcParameters = R.reduce(
            (rowsObject, row) => {
              const {datasetID, name, ...rowObjParameters} = R.addIndex(R.reduce)(
                (rowObj, lens, index) => R.set(lens, R.nth(index, row), rowObj),
                {},
                headerLens
              )
              return R.set(R.lensProp(datasetID), rowObjParameters, rowsObject)
            },
            {},
            body
          )

          const {parameters} = run

          bulkUpdateRunParameterValues({
            variables: {
              parameters: {...parameters, quality: qcParameters}
            }
          })
        },
        error: (err, file) => console.log('QC template upload error', err, file)
      })
    }
  }, [run])

  return {templateDownloadLink, onDrop}
}
