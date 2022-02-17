


import { Button, Card, Divider, Header, Icon, Label, Message, Popup, Segment, Transition } from 'semantic-ui-react'
import { useActor } from '@xstate/react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import moment from 'moment'

import { queryIsNotNil } from '../../../../utils'

import { useCrescentContext, useMachineServices } from '../../../../redux/hooks'
import { useNewProjectEvents } from '../../../../xstate/hooks'

export const DatasetsPopoverContent = ({ allDatasets }) => {
  return (
    <Message>
      <Message.Content>
      <Divider horizontal content="Datasets" />
        <Label.Group>
        {
          R.map(
            ({datasetID, name}) => (
              <Label key={datasetID}>
                {name}
              </Label>
            ),
            allDatasets
          )
        }
        </Label.Group>
      </Message.Content>
    </Message>
  )
}

const ProjectCard = ({
  project: {
    projectID,
    name,
    createdOn,
    createdBy: {
      name: creatorName
    },
    allDatasets
  }
}) => {
  const {newProjectService} = useMachineServices()
  const [{context: {mergedProjectIDs}}] = useActor(newProjectService)
  const {toggleMergedProject} = useNewProjectEvents()
  const isSelectedForMerge = R.includes(projectID, mergedProjectIDs)

  const uniqueOncotreeCodesArray = R.compose(R.uniq, R.reject(R.isNil), R.pluck('oncotreeCode'))(allDatasets)

  return (
    <Transition
      visible
      animation="fade up"
      duration={1000}
      transitionOnMount={true}
      unmountOnHide={true}
    >
      <Card
        link
        color={isSelectedForMerge ? 'blue' : 'grey'}
        onClick={() => {
          toggleMergedProject({ projectID })
        }}
      >
        <Popup
          size="large"
          trigger={
            <Button attached="top" color={isSelectedForMerge ? 'blue' : 'grey'}>
              <Icon name={isSelectedForMerge ? 'folder open' : 'folder outline'} size="large" />
            </Button>
          }
          wide="very"    
        >
          <DatasetsPopoverContent {...{allDatasets}} />
        </Popup>
        <Card.Content extra>
          <Header size="small">
            <Header.Content>
              {name}
            </Header.Content>
          </Header>
        </Card.Content>
        <Card.Content>
          <Label.Group>
            <Label content={<Icon name="user" style={{margin: 0}} />} detail={creatorName} />
            <Label content={<Icon name="calendar alternate outline" style={{margin: 0}} />} detail={moment(createdOn).format('DD MMM YYYY')} />
            <Label content={<Icon name="upload" style={{margin: 0}}  />} detail={`${R.length(allDatasets)} dataset(s)`} />
            {
              R.map(
                oncotreeCode => <Label key={oncotreeCode} content={<Icon style={{margin: 0}} name="paperclip" />} detail={oncotreeCode} />,
                uniqueOncotreeCodesArray
              )
            }
          </Label.Group>
        </Card.Content>
      </Card>
    </Transition>
  )
}

const PublicProjects = () => {
  // GQL query to find all public projects
  const {data} = useQuery(gql`
    query {
      curatedProjects {
        projectID
        name
        kind
        createdOn
        createdBy {
          name
          userID
        }
        allDatasets {
          datasetID
          name
          oncotreeCode
        }
      }
    }
  `, {
    fetchPolicy: 'cache-and-network'
  })
  const curatedProjects = R.ifElse(
    queryIsNotNil('curatedProjects'),
    R.prop('curatedProjects'),
    R.always([])
  )(data)

  return (
    R.isEmpty(curatedProjects) ? (
      <Segment placeholder>
        <Header icon>
          <Icon name="exclamation" />
          No Projects
        </Header>
      </Segment>
    ) : (
      <Card.Group itemsPerRow={3}>
        {
          R.addIndex(R.map)(
            (project, index) => <ProjectCard key={index} {...{project}} />,
            curatedProjects
          )
        }
      </Card.Group>
    )
  )
}

const UploadedProjects = () => {
  const {userID} = useCrescentContext()
  // GQL query to find all projects of which the user is a member of
  const {data} = useQuery(gql`
    query UserProjects($userID: ID) {
      projects(userID: $userID) {
        projectID
        name
        createdOn
        createdBy {
          name
          userID
        }
        allDatasets {
          datasetID
          name
          oncotreeCode
        }
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {userID}
  })
  const userProjects = R.ifElse(
    queryIsNotNil('projects'),
    R.prop('projects'),
    R.always([])
  )(data)

  return (
    R.isEmpty(userProjects) ? (
      <Segment placeholder>
        <Header icon>
          <Icon name="exclamation" />
          No Projects
        </Header>
      </Segment>
    ) : (
      <Card.Group itemsPerRow={3}>
        {
          R.addIndex(R.map)(
            (project, index) => <ProjectCard key={index} {...{project}} />,
            userProjects
          )
        }
      </Card.Group>
    )
  )
}

export {PublicProjects, UploadedProjects}