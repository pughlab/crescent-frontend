import React from 'react'
import {Accordion, Button, Divider, Header, Icon, Label, Message, Modal, Popup, Segment} from 'semantic-ui-react'
import moment from 'moment'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useDispatch} from 'react-redux'
import {resetAccordionIndices, resetProjectArchive, setConfirmArchiveProjectOpen, setConfirmArchiveRunsOpen, toggleAccordionIndices} from '../../../../redux/actions/projectArchive'
import {useProjectArchive} from '../../../../redux/hooks'

const getStatusColor = R.prop(R.__, {
  pending: 'orange',
  submitted: 'yellow',
  completed: 'green',
  failed: 'red'
})

const getStatusIcon = R.prop(R.__, {
  pending: 'circle outline',
  submitted: 'circle notch',
  completed: 'check circle outline',
  failed: 'times circle outline'
})

const ConfirmArchiveProjectModal = ({ allProjectRuns, archiveProject, createdOn, projectDescription, projectName }) => {
  const dispatch = useDispatch()
  const {confirmArchiveProjectOpen} = useProjectArchive()

  const numProjectRuns = R.length(allProjectRuns)

  const getNumProjectRunsByStatus = status => R.length(R.filter(
    R.compose(
      R.equals(status),
      R.prop('status')
    ),
    allProjectRuns
  ))

  return (
    <Modal
      onClose={() => dispatch(setConfirmArchiveProjectOpen({open: false}))}
      onOpen={() => dispatch(setConfirmArchiveProjectOpen({open: true}))}
      open={confirmArchiveProjectOpen}
      size="small"
      trigger={
        <Button
          fluid
          inverted
          animated="vertical"
          color="red"
        >
          <Button.Content visible>
            <Icon.Group>
              <Icon name="folder" />
              <Icon corner name="close" />
            </Icon.Group>
          </Button.Content>
          <Button.Content hidden content="Delete project" />
        </Button>
      }
    >
      <Modal.Header>
        <Header
          content={projectName}
          icon="exclamation"
          size="tiny"
          subheader="Are you sure you would like to delete the project?"
        />
      </Modal.Header>
      <Modal.Content scrolling>
        <Segment>
          <Header content={projectName} />
          <Label.Group>
            <Popup flowing trigger={
              <Label
                content={`${numProjectRuns} run${R.equals(numProjectRuns, 1) ? '' : 's'}`}
                icon="file"
              />
            }>
              <Message>
                <Message.Content>
                  <Divider horizontal content="Run Statuses" />
                  <Label.Group>
                    {
                      R.map(
                        status => (
                          <Label
                            key={status}
                            color={getStatusColor(status)}
                            content={`${getNumProjectRunsByStatus(status)} ${status}`}
                            icon={
                              <Icon
                                name={getStatusIcon(status)}
                                loading={R.equals('submitted', status)}
                              />
                            }
                          />
                        ),
                        ['pending', 'submitted', 'completed', 'failed']
                      )
                    }
                  </Label.Group>
                </Message.Content>
              </Message>
            </Popup>
            <Label
              content={`${moment(createdOn).format('D MMMM YYYY, h:mm a')}`}
              icon="calendar"
            />
          </Label.Group>
          <Message
            content={projectDescription}
            size="tiny"
          />
        </Segment>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Cancel"
          icon="cancel"
          onClick={() => dispatch(setConfirmArchiveProjectOpen({open: false}))}
        />
        <Button
          color="red"
          content="Delete"
          icon="trash"
          onClick={() => archiveProject()}
        />
      </Modal.Actions>
    </Modal>
  )
}

const ConfirmArchiveRunsModal = ({ allProjectRuns, archiveRuns, projectName, removeRuns }) => {
  const dispatch = useDispatch()
  const {accordionIndices, confirmArchiveRunsOpen, selectedRuns} = useProjectArchive()

  const isSelectedToDelete = ({runID}) => R.includes(runID, selectedRuns)
  const runsSelectedToDelete = R.filter(isSelectedToDelete, allProjectRuns)

  const handleAccordionClick = (e, {index}) => {
    dispatch(toggleAccordionIndices({index}))
  }

  return (
    <Modal
      onClose={() => {
        dispatch(setConfirmArchiveRunsOpen({open: false}))
        dispatch(resetAccordionIndices())
      }}
      onOpen={() => dispatch(setConfirmArchiveRunsOpen({open: true}))}
      open={confirmArchiveRunsOpen}
      size="small"
      trigger={
        <Button
          fluid
          inverted
          animated="vertical"
          color="red"
          disabled={RA.isEmptyArray(selectedRuns)}
        >
          <Button.Content visible>
            <Icon.Group>
              <Icon name="file" />
              <Icon corner name="close" />
            </Icon.Group>
          </Button.Content>
          <Button.Content hidden content={`Delete selected run${RA.lengthGt(1, selectedRuns) ? 's' : ''}`} />
        </Button>
      }
    >
      <Modal.Header>
        <Header
          content={projectName}
          icon="exclamation"
          size="tiny"
          subheader={`Are you sure you would like to delete the following run${RA.lengthGt(1, selectedRuns) ? 's' : ''}?`}
        />
      </Modal.Header>
      <Modal.Content scrolling>
        <Accordion fluid>
          { R.addIndex(R.map)(
            ({ completedOn, createdOn, description, name, status, submittedOn }, index) => (
              <React.Fragment key={index}>
                <Accordion.Title
                  active={R.includes(index, accordionIndices)}
                  content={
                    <Label
                      color="blue"
                      content={name}
                      icon="file"
                    />
                  }
                  index={index}
                  icon="dropdown"
                  onClick={handleAccordionClick}
                />
                <Accordion.Content active={R.includes(index, accordionIndices)}>
                  <Segment>
                    <Header content={name} />
                    <Label.Group>
                      <Label
                        color={getStatusColor(status)}
                        content={status}
                        icon={getStatusIcon(status)}
                      />
                      <Label
                        content={`${moment(RA.isNotNil(submittedOn) ? submittedOn: createdOn).format('D MMMM YYYY, h:mm a')}`}
                        icon="calendar alternate outline"
                      />
                      { RA.isNotNil(submittedOn) && (
                        <Label
                          content={`${moment(RA.isNotNil(completedOn) ? completedOn : new Date()).diff(moment(submittedOn), 'minutes')} minutes`}
                          icon="clock"
                        />
                      )}
                    </Label.Group>
                    <Message
                      content={description}
                      size="tiny"
                    />
                  </Segment>
                </Accordion.Content>
              </React.Fragment>
            ),
            runsSelectedToDelete
          )}
        </Accordion>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Cancel"
          icon="cancel"
          onClick={() => dispatch(setConfirmArchiveRunsOpen({open: false}))}
        />
        <Button
          color="red"
          content="Delete"
          icon="trash"
          onClick={async () => {
            const {data: {archiveRuns: archiveRunResult}} = await archiveRuns({variables: {runIDs: selectedRuns}})

            if (archiveRunResult) {
              removeRuns(selectedRuns)
              dispatch(resetProjectArchive())
            }
          }}
        />
      </Modal.Actions>
    </Modal>
  )
}

export {
  ConfirmArchiveProjectModal,
  ConfirmArchiveRunsModal
}