import { useEffect } from 'react'
import { useInterpret } from '@xstate/react'
import SecondaryRunMachine from './machine'
import { useDispatch } from 'react-redux'
import { setAnnotationsService } from '../../../actions/annotations'
import { useAnnotations } from '../../../hooks'

// Hook for initializing the SecondaryRunMachine and saving the service to Redux
const useSecondaryRunMachine = () => {
  const dispatch = useDispatch()
  const { annotationsService } = useAnnotations()
  // Create service from the SecondaryRunMachine
  const initialService = useInterpret(SecondaryRunMachine)

  // Save the service to Redux
  useEffect(() => {
    dispatch(setAnnotationsService({ service: initialService }))
  }, [dispatch, initialService])

  return annotationsService
}

export default useSecondaryRunMachine