import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setIsPlotLoading } from '../../../redux/actions/resultsPage'

export default function usePlotLoadingEffect(loading) {
  const dispatch = useDispatch()
  useEffect(() => {
    //use dispatch redux action to change value of resultsPage.isPlotLoading
    dispatch(setIsPlotLoading({ value: loading }))
  }, [loading])
}

