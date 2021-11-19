import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import { useDispatch } from 'react-redux'
import { setGenePosUploaded } from '../../../redux/actions/annotations'
import { useAnnotations } from '../../../redux/hooks'

export default function useUploadGenePosMutation({ runID }) {
  const dispatch = useDispatch()
  const {genePosUploaded} = useAnnotations()

  const [uploadGenePos, {loading}] = useMutation(gql`
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
      dispatch(setGenePosUploaded({uploaded: RA.isNotNil(run)}))
    }
  })

  return {uploadGenePos, loading, genePosUploaded}
}