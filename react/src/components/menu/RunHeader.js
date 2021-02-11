import React from 'react'
import * as R from 'ramda'

import {Header, Popup, Message, Label, Divider} from 'semantic-ui-react'

import {useCrescentContext} from '../../redux/hooks'
import {useRunDetailsQuery} from '../../apollo/hooks/run'

import moment from 'moment'

const RunHeader = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  if (R.isNil(run)) {
    return null
  }
  const {
    name: runName,
    project: {name: projectName},
    createdOn,
    status,
    createdBy: {
      name: creatorName
    },

    datasets //{datasetID, name, size, hasMetadata}
  } = run
  const color = R.prop(status, {
    pending: 'orange',
    submitted: 'yellow',
    completed: 'green',
    failed: 'red'
  })
  return (
    <Popup
      trigger={
        <Header textAlign='center' content={projectName} subheader={runName} />
      }
      wide='very'
      position='bottom center'
    >
      <Message color={color}>
        <Message.Content>
        <Message.Header as={Header} textAlign='center'>
          Created by {creatorName} on {moment(createdOn).format('D MMMM YYYY, h:mm a')}
        </Message.Header>
        <Divider horizontal content='Datasets' />
        <Label.Group>
        {
          R.map(
            ({datasetID, name, size, hasMetadata}) => (
              <Label key={datasetID} content={name} />
            ),
            datasets
          )
        }
        </Label.Group>
        </Message.Content>
      </Message>
    </Popup>
  )
}

export default RunHeader