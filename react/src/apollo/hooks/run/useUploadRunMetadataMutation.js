import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { UPLOAD_RUN_METADATA } from '../../queries/run'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useUploadRunMetadataMutation({
  runID
}) {
  const [success, setSuccess] = useState(false)
  const [uploadRunMetadata, {loading, data, error}] = useMutation(UPLOAD_RUN_METADATA, {
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