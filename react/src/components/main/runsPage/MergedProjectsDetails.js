import React from 'react'
import {Button, Divider, Header, Icon, Label, Modal, Segment} from 'semantic-ui-react'
import {useDispatch} from 'react-redux'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useProjectDetailsQuery} from '../../../apollo/hooks/project'
import {useCrescentContext} from '../../../redux/hooks'
import {setProject} from '../../../redux/actions/context'

const ViewProjectModal = ({ projectID }) => {
  const dispatch = useDispatch()
  const project = useProjectDetailsQuery(projectID)

  if (R.isNil(project)) return null

  const {
    name,
    createdBy: {
      name: creatorName
    },
    description,
    archived
  } = project

  return (
    <Modal
      trigger={
        <Label as={Button}>
          {name}
          { RA.isNotNil(archived) && (
            <>
              {' '}
              <small>(archived)</small>
            </>
          )}
        </Label>
      }
    >
      <Modal.Content>
        <Header icon textAlign="center">
          <Icon name="folder open" />
          {name}
          <Header.Subheader>
            <i>{`Created by ${creatorName}`}</i>
          </Header.Subheader>
          <Header.Subheader>
            {description}
          </Header.Subheader>
        </Header>
        { RA.isNotNil(project) && (
          <Button
            fluid
            content="View this project"
            onClick={() => dispatch(setProject({projectID}))}
          />
        )}
      </Modal.Content>
    </Modal>
  )
}

const MergedProjectsDetails = () => { 
  const {projectID} = useCrescentContext()
  const project = useProjectDetailsQuery(projectID)

  if (R.isNil(project)) return null

  const {mergedProjects} = project

  return (
    <Segment attached>
      <Divider horizontal>
        <Header content="Integrated Projects" />
      </Divider>
      <Label.Group size="large">
        {
          R.map(
            ({projectID}) => (
              <ViewProjectModal key={projectID} {...{projectID}} />
            ),
            mergedProjects
          )
        }
      </Label.Group>
    </Segment>
  )
}

export default MergedProjectsDetails