import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import { useDispatch } from 'react-redux'
import { setSampleAnnotsUploaded } from '../../../redux/actions/annotations'
import { useAnnotations } from '../../../redux/hooks'

export default function useUploadSampleAnnotsMutation(runID) {
  const dispatch = useDispatch()
  const {sampleAnnotsUploaded} = useAnnotations()

  const [uploadSampleAnnots, {loading}] = useMutation(gql`
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
      dispatch(setSampleAnnotsUploaded({uploaded: RA.isNotNil(run)}))
    }
  })

  return {uploadSampleAnnots, loading, sampleAnnotsUploaded}
}