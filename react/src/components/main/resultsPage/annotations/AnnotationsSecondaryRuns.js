import React, { useEffect } from 'react'
import { useActor } from '@xstate/react'
import { Divider, Header, Icon, List, Segment } from 'semantic-ui-react'
import * as R from 'ramda'
import Fade from 'react-reveal/Fade'

import { useAnnotations, useCrescentContext } from '../../../../redux/hooks'

import { useCancelSecondaryRunMutation } from '../../../../apollo/hooks/run'

import AnnotationsSecondaryRunEntry from './AnnotationsSecondaryRunEntry'
import { useSecondaryRunEvents } from '../../../../redux/helpers/machines/SecondaryRunMachine/useSecondaryRunMachine'

const NoSecondaryRuns = ({ annotationType }) => (
  <Fade up>
    <Divider horizontal content={`${annotationType} Run Status`} />
    <Segment color="purple">    
      <Segment placeholder>
        <Header icon>
          <Icon name="exclamation" />
          No {annotationType} Runs
        </Header>
      </Segment>
    </Segment>
  </Fade>
)

const AnnotationsSecondaryRuns = ({ annotationType, secondaryRuns }) => {
  const { annotationsService: service } = useAnnotations()
  const { runID } = useCrescentContext()
  const [{ context: { secondaryRunWesID }}] = useActor(service)
  const cancelSecondaryRun = useCancelSecondaryRunMutation(runID, secondaryRunWesID)
  const { cancelSecondaryRunInit } = useSecondaryRunEvents()

  const secondaryRunsByAnnotationType = R.filter(R.propEq('type', annotationType), secondaryRuns)

  useEffect(() => {
    cancelSecondaryRunInit({
      cancelFunction: cancelSecondaryRun
    })
  }, [cancelSecondaryRun, cancelSecondaryRunInit])

  if (R.isEmpty(secondaryRunsByAnnotationType)) return <NoSecondaryRuns {...{annotationType}} />

  return (
    <>
      <Divider horizontal content={`${annotationType} Run Status`} />
      <Segment color="purple">
        <List
          celled
          divided
          relaxed
          selection
          size="large"
        >
          {
            R.compose(
              R.map(secondaryRun => (
                <AnnotationsSecondaryRunEntry
                  key={secondaryRun.wesID}
                  {...secondaryRun}
                />
              )),
              R.reverse
            )(secondaryRunsByAnnotationType)
          }
        </List>
      </Segment>
    </>
  )
}

export default AnnotationsSecondaryRuns
export {NoSecondaryRuns}