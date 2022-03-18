import React, { useEffect, useState } from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'


import ProjectArchiveModal from './ProjectArchiveModal'
import ShareProjectModal from './ShareProjectModal'
import UnsubscribeProjectModal from './UnsubscribeProjectModal'

import MergedProjectsDetails from './MergedProjectsDetails'
import UploadedDatasetsDetails from './UploadedDatasetsDetails'

import NewRunModal from './NewRunModal'
import RunsStatusLegend from './RunsStatusLegend'
import ProjectRunsList from './ProjectRunsList'


import { Segment, Container, Button, Divider, Header, Popup, Label, Grid, Modal } from 'semantic-ui-react'

import Fade from 'react-reveal/Fade'

import { useCrescentContext } from '../../../redux/hooks'
import {useProjectArchiveMutation, useProjectRunsQuery} from '../../../apollo/hooks/project'

import {useDispatch} from 'react-redux'
import {resetRunsPage} from '../../../redux/actions/runsPage'
import CompareModal from '../comparePage/CompareModal';

import ProjectHeader from '../../menu/ProjectHeader'
import useGAPageView from '../../../analytics/hooks/useGAPageView'

const RunsPageComponent = () => {
  const dispatch = useDispatch()
  const { userID: currentUserID, projectID } = useCrescentContext()
  useEffect(() => () => dispatch(resetRunsPage()), [projectID])
  const { archiveProject, archiveRuns, project } = useProjectArchiveMutation(projectID)
  const { getUpdatedRun, projectRuns, removeRuns } = useProjectRunsQuery(projectID)

  const [open, setOpen] = useState(false)

  //Google Analytics implementation
  useGAPageView({route: '/runs'})

  if (R.isNil(project)) {
    return null
  }

  // es6 destructuring
  const {
    name: projectName,
    kind: projectKind,
    createdBy: {
      name: creatorName,
      userID: creatorUserID
    },
    createdOn: projectCreatedOn,
    description,
    accession,
    externalUrls,

    uploadedDatasets,
    mergedProjects,
    archived
  } = project
  
  const isUploadedProject = R.equals(projectKind, 'uploaded')
  const currentUserIsCreator = R.equals(currentUserID, creatorUserID)
  const projectIsArchived = RA.isNotNil(archived)
  const isPublic = R.equals('curated')

  return (    
    <>
      <Fade duration={2000}>
      <Segment basic>
      <Container>
        {/* PROJECT CREATOR ACTIONS */}
        {
          R.and(isUploadedProject, currentUserIsCreator) &&
          <Button.Group attached='top' widths={2} size='large'>
            <ShareProjectModal {...{project}} />
            <ProjectArchiveModal {...{archiveProject, archiveRuns, project, projectRuns, removeRuns}} />
          </Button.Group>
        }

        {/*SHARED WITH ACTIONS */}
        {
          R.and(isUploadedProject, !currentUserIsCreator) &&
          <Button.Group attached='top' widths={1} size='large'>
            <UnsubscribeProjectModal {...{ project }} />
          </Button.Group>
        }

        {/* PROJECT ABSTRACT AND DETAILS */}
        <Segment attached>
          <Divider horizontal>
            <Header content={'Project Details'} />
          </Divider>
          { projectIsArchived && (
            <Label
              ribbon
              color="red"
              content="Archived"
              size="large"
            />
          )}
          {
              RA.isNotNil(accession) &&
              <Label as='a' ribbon content='ID' detail={isPublic(projectKind) ? `CRES-P${accession}`  : `CRES-U${accession}`} />
          }
          <Header>
            <Header.Content content={projectName} />
            <Header.Subheader content={`Created by ${creatorName} on ${moment(projectCreatedOn).format('D MMMM YYYY')}`} />
            { projectIsArchived && (
              <Header.Subheader content={`Archived on ${moment(archived).format('D MMMM YYYY')}`} />
            )}
          </Header>
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

        {
          R.and(R.isEmpty(uploadedDatasets), RA.isNotEmpty(mergedProjects)) ?
            // {/* LIST OF MERGED PROJECTS  */}
            <MergedProjectsDetails />
          : R.and(R.isEmpty(mergedProjects), RA.isNotEmpty(uploadedDatasets)) ?
            // {/* LIST OF UPLOADED DATASETS */}
            <UploadedDatasetsDetails />
          :
            <Segment attached as={Grid} columns={2}>
              <Grid.Column>  
                <MergedProjectsDetails />
              </Grid.Column>
              <Grid.Column>
                <UploadedDatasetsDetails />
              </Grid.Column>
            </Segment>
        }


        <Segment attached='bottom'>
          <Divider horizontal>
            <Header content={'Project Runs'} />
          </Divider>
          {/* CREATE NEW RUN MODAL */}
          <NewRunModal {...{project}} />
          {/* SHOW RUNS BY STATUS */}
          {/* {isUploadedProject && <RunsStatusLegend />} */}
          { <RunsStatusLegend {...{projectRuns}} />}

          <ProjectRunsList {...{getUpdatedRun, projectRuns}} />

        </Segment>
        
      </Container>
      </Segment>
      </Fade>
      <CompareModal />
    </>
  )
}

export default RunsPageComponent