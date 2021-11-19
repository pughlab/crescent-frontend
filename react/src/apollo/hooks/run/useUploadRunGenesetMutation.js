import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import { useDispatch } from 'react-redux'
import { setGenesetUploaded } from '../../../redux/actions/annotations'
import { useAnnotations } from '../../../redux/hooks'

export default function useUploadRunGenesetMutation({ runID }) {
  const dispatch = useDispatch()
  const {genesetUploaded} = useAnnotations()
  
  const [uploadRunGeneset, {loading}] = useMutation(gql`
    mutation UploadRunGeneset(
      $runID: ID!
      $geneset: Upload!
    ) {
      uploadRunGeneset(
        runID: $runID
        geneset: $geneset
      ) {
        runID
      }
    }
  `, {
    variables: {
      runID
    },
    onCompleted: ({uploadRunGeneset: run}) => {
      dispatch(setGenesetUploaded({uploaded: RA.isNotNil(run)}))
    }
  })

  return {uploadRunGeneset, loading, genesetUploaded}
}