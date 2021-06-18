import React, { useState } from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Header, Popup, Message, Label, Divider, Modal, Button, Icon } from 'semantic-ui-react'

import { useCrescentContext } from '../../redux/hooks'
import { useRunDetailsQuery } from '../../apollo/hooks/run'

import moment from 'moment'

const RunHeader = ({

}) => {
  const { runID } = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const [open, setOpen] = useState(false) // whether or not Modal is open
  if (R.isNil(run)) {
    return null
  }
  const {
    name: runName,
    description: runDescription,
    project: { name: projectName },
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
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      size='large'
      trigger={
        <Popup
          on='hover'
          trigger={
            <Label as={Button} basic onClick={() => setOpen(true)}>
              <Header textAlign="center">{projectName}
                <Header.Subheader>{runName}</Header.Subheader>
              </Header>
            </Label>
          }
          wide='very'
          position='bottom center'
        >
          <Message color={color}>
            <Message.Content>
              <Message.Header as={Header} textAlign='center'>
                Created by {creatorName} on {moment(createdOn).format('D MMMM YYYY, h:mm a')}
              </Message.Header>
              {
                R.and(RA.isNotEmpty(runDescription), RA.isNotNil(runDescription)) &&
                <>
                  <Divider horizontal content='Details' />
                  <p>{runDescription}</p>
                </>
              }
              <Divider horizontal content='Datasets' />
              <Label.Group>
                {
                  R.map(
                    ({ datasetID, name, cancerTag, size, hasMetadata }) => (
                      <Label key={datasetID}
                        color={R.prop(cancerTag, {
                          true: 'pink',
                          false: 'purple',
                          null: 'blue',
                        })}
                      >
                        {name}
                        {<Label.Detail content={cancerTag ? 'CANCER' : R.equals(cancerTag, null) ? 'IMMUNE' : 'NON-CANCER'} />}
                      </Label>
                    ),
                    datasets
                  )
                }
              </Label.Group>
            </Message.Content>
          </Message>
        </Popup>
      }
    ></Modal>
      
  )
}

export default RunHeader