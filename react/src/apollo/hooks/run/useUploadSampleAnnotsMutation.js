import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useUploadSampleAnnotsMutation({
  runID
}) {
  const [success, setSuccess] = useState(false)
  const [uploadSampleAnnots, {loading, data, error}] = useMutation(gql`
    mutation UploadSampleAnnots(
      $runID: ID!
      $sampleAnnots: Upload!
    ) {
      uploadSampleAnnots(
        runID: $runID
        sampleAnnots: $sampleAnnots
      ) {
        runID
      }
    }
  `, {
    variables: {
      runID
    },
    onCompleted: ({uploadSampleAnnots: run}) => {
      if (RA.isNotNil(run)) {
        setSuccess(true)
      }
    }
  })

  return {uploadSampleAnnots, loading, success}
}