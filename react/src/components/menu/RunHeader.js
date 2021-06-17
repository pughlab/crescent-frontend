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
    description: runDescription,
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
        <Header textAlign="center">
          {projectName}
          <Header.Subheader><b>{runName}</b></Header.Subheader>
          <Header.Subheader>{runDescription}</Header.Subheader>
        </Header>
        
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
            ({datasetID, name, cancerTag, size, hasMetadata}) => (
              <Label key={datasetID} 
                color={R.prop(cancerTag, {
                  true: 'pink',
                  false: 'purple',
                  null: 'blue',
                })}
              >
                {name}
                {<Label.Detail content={cancerTag ? 'CANCER' : R.equals(cancerTag, null) ? 'IMMUNE' : 'NON-CANCER'}  />}
              </Label>
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