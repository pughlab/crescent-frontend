import {useActor} from '@xstate/react'
import {useMutation} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import {useAnnotations} from '../../../redux/hooks'

const useCancelSecondaryRunMutation = (runID, secondaryRunWesID) => {
  const {annotationsService: service} = useAnnotations()
  const [{context: {annotationType}}] = useActor(service)

  const [cancelSecondaryRun] = useMutation(gql`
    mutation cancelSecondaryRun($annotationType: String, $runID: ID, $wesID: ID) {
      cancelSecondaryRun(annotationType: $annotationType, runID: $runID, wesID: $wesID)
    }
  `, {
    variables: {
      annotationType,
      runID,
      wesID: secondaryRunWesID
    }
  })

  return cancelSecondaryRun
}

export default useCancelSecondaryRunMutation