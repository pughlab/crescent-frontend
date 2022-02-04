import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useMachineServices() {
  // Get services object from redux store
  const machineServicesSelector = createSelector(R.prop('machineServices'), R.identity)
  const machineServices = useSelector(machineServicesSelector)
  return machineServices
}