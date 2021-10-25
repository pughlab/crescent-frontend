import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useUploadGenePosMutation({
  runID
}) {
  const [success, setSuccess] = useState(false)
  const [uploadGenePos, {loading, data, error}] = useMutation(gql`
    mutation UploadGenePos(
      $runID: ID!
      $genePos: Upload!
    ) {
      uploadGenePos(
        runID: $runID
        genePos: $genePos
      ) {
        runID
      }
    }
  `, {
    variables: {
      runID
    },
    onCompleted: ({uploadGenePos: run}) => {
      if (RA.isNotNil(run)) {
        setSuccess(true)
      }
    }
  })

  return {uploadGenePos, loading, success}
}