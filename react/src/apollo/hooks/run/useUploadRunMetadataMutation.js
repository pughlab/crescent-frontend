import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import { useDispatch } from 'react-redux'
import { useAnnotations } from '../../../redux/hooks'
import { setMetadataUploaded } from '../../../redux/actions/annotations'

export default function useUploadRunMetadataMutation({ runID }) {
  const dispatch = useDispatch()
  const {metadataUploaded} = useAnnotations()

  const [uploadRunMetadata, {loading}] = useMutation(gql`
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
      dispatch(setMetadataUploaded({uploaded: RA.isNotNil(run)}))
    }
  })

  return {uploadRunMetadata, loading, metadataUploaded}
}