import React from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import RunsStatusLegend from './RunsStatusLegend'

import {Segment, Container, Button, Divider, Header, Popup, Label} from 'semantic-ui-react'

import {useProjectDetailsQuery} from '../../../apollo/hooks'
import {useCrescentContext} from '../../../redux/hooks'

const RunsPageComponent = ({

}) => {
  const {projectID} = useCrescentContext()
  const project = useProjectDetailsQuery(projectID)
  console.log(project)
  if (R.isNil(project)) {
    return null
  }

  const {
    name: projectName,
    kind: projectKind,
    createdBy: {name: creatorName},
    createdOn: projectCreatedOn,
    description,
    externalUrls
  } = project
  const isUploadedProject = R.equals(projectKind, 'uploaded')
  return (
    <Segment basic>
    <Container>
      {/* PROJECT CREATOR ACTIONS */}
      <Button.Group attached='top' widths={3} size='large'>
        <Button content='ad' />
        <Button content='ad' />
        <Button content='ad' />
      </Button.Group>

      {/* PROJECT ABSTRACT AND DETAILS */}
      <Segment attached>
        <Divider horizontal>
          <Header content={'Project Details'} />
        </Divider>
        <Header
          content={projectName}
          subheader={`Created by ${creatorName} on ${moment(projectCreatedOn).format('D MMMM YYYY')}`}
        />
        <Divider horizontal />
        {description}
        {
          RA.isNotEmpty(externalUrls) && 
          <>
          <Divider horizontal />
          {
            R.map(
              ({label, link, type}) => (
                <Popup key={label}
                  inverted
                  trigger={<Label as='a' href={link} icon={type} target="_blank" content={label}/>}
                  content={link}
                />
              ),
              externalUrls
            )
            }
          </>
        }
      </Segment>

      <Segment attached>
        <Divider horizontal>
          <Header content={'Project Runs'} />
        </Divider>

        {/* SHOW RUNS BY STATUS */}
        {isUploadedProject && <RunsStatusLegend />}
        
      </Segment>
      
    </Container>
    </Segment>
  )
}

export default RunsPageComponent