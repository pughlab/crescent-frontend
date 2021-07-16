import { useService } from '@xstate/react'
import { useResultsPage } from '../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'

export default function useMachineService() {
    const { activePlot } = useResultsPage()
    const { service } = useResultsPagePlotQuery(activePlot)
    return useService(service)
}
