import React from 'react'
import {Divider, List, Segment} from 'semantic-ui-react'
import * as R from 'ramda'

import AnnotationsSecondaryRunEntry from './AnnotationsSecondaryRunEntry'

const AnnotationsSecondaryRuns = ({ secondaryRuns }) => {
  return (
    <>
      <Divider horizontal content='GSVA Run Status' />
      <Segment color='purple'>
        <List divided relaxed selection celled size='large'>
          {
            R.compose(
              R.map(secondaryRun => (
                <AnnotationsSecondaryRunEntry
                  key={secondaryRun.wesID}
                  {...secondaryRun}
                />
              )),
              R.reverse
            )(secondaryRuns)
          }
        </List>
      </Segment>
    </>
  )
}

export default AnnotationsSecondaryRuns