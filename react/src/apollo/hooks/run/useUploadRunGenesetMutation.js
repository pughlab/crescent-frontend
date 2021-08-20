import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { UPLOAD_RUN_GENESET } from '../../queries/run'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useUploadRunGenesetMutation({
  runID
}) {
  const [success, setSuccess] = useState(false)
  const [uploadRunGeneset, {loading, data, error}] = useMutation(UPLOAD_RUN_GENESET, {
    variables: {
      runID
    },
    onCompleted: ({uploadRunGeneset: run}) => {
      if (RA.isNotNil(run)) {
        setSuccess(true)
      }
    }
  })

  return {uploadRunGeneset, loading, success}
}