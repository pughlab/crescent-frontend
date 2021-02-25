import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useUploadRunMetadataMutation({
  runID
}) {
  const [success, setSuccess] = useState(false)
  const [uploadRunMetadata, {loading, data, error}] = useMutation(gql`
    mutation UploadRunMetadata(
      $runID: ID!
      $metadata: Upload!
    ) {
      uploadRunMetadata(
        runID: $runID
        metadata: $metadata
      ) {
        runID
      }
    }
  `, {
    variables: {
      runID
    },
    onCompleted: ({uploadRunMetadata: run}) => {
      if (RA.isNotNil(run)) {
        setSuccess(true)
      }
    }
  })

  return {uploadRunMetadata, loading, success}
}