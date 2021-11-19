import React from 'react'
import {Divider, Header, Icon, List, Segment} from 'semantic-ui-react'
import * as R from 'ramda'
import Fade from 'react-reveal/Fade'

import AnnotationsSecondaryRunEntry from './AnnotationsSecondaryRunEntry'

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
  const secondaryRunsByAnnotationType = R.filter(R.propEq('type', annotationType), secondaryRuns)

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