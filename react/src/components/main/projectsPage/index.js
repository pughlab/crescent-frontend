import React, {useEffect} from 'react';
import * as R from 'ramda'

import {Header, Button, Segment, Divider, Message} from 'semantic-ui-react'
import Fade from 'react-reveal/Fade'

import {useDispatch} from 'react-redux'
import {useProjectsPage, useCrescentContext} from '../../../redux/hooks'
import {resetProjectsPage, setActiveProjectKind} from '../../../redux/actions/projectsPage'
import {setProject} from '../../../redux/actions/context'

import PublicProjectsList from './PublicProjectsList'
import UploadedProjectsList from './UploadedProjectsList'
import ProjectSearchInput from './ProjectSearchInput'
import NewProjectModal from './NewProjectModal'
import CompareModal from '../comparePage/CompareModal';
import useGAPageView from '../../../analytics/hooks/useGAPageView';

const ProjectsPageComponent = ({

}) => {
  const dispatch = useDispatch()
  const {userID, projectID} = useCrescentContext()
  useEffect(() => {dispatch(resetProjectsPage())}, [userID, projectID])

  const {activeProjectKind} = useProjectsPage()
  const isActiveProjectKind = R.equals(activeProjectKind)

  //Google Analytics implementation
  useGAPageView({route: '/projects'})

  return (
    <>
      <Fade duration={2000}>
      <Segment basic>
        <Divider horizontal>
          <Header size='large' content={'PROJECTS'} subheader={'Select a public project or upload data to begin'} />
        </Divider>

        <Button.Group fluid widths={2} attached='top'>
          <Button color='black'
            onClick={() => dispatch(setActiveProjectKind({projectKind: 'public'}))}
            active={isActiveProjectKind('public')} 
            basic={R.not(isActiveProjectKind('public'))}
          >
            <Header
              inverted={isActiveProjectKind('public')}
              content='Public' subheader='Published/example datasets accepted by CReSCENT'
            />
          </Button>

          <Button color='black'
            onClick={() => dispatch(setActiveProjectKind({projectKind: 'uploaded'}))}
            active={isActiveProjectKind('uploaded')} 
            basic={R.not(isActiveProjectKind('uploaded'))}
          >
            <Header
              inverted={isActiveProjectKind('uploaded')}
              content='Uploaded' subheader='Upload your own scRNA-seq data'
            />
          </Button>
        </Button.Group>
        {
          R.equals(activeProjectKind, 'uploaded') ?
          <Fade down>
            <Segment attached>
              <NewProjectModal />
            </Segment>
          </Fade>
          :
          // <Fade down>
          <Segment attached>
            <Message error>
              <Message.Content>
                Due to refactoring of CReSCENT pipelines to integrate multiple datasets, access to some public data is currently unavailable. If you are interested in a particular cancer dataset to be indexed please send us an email at <a href='mailto:crescent@uhnresearch.ca'>crescent@uhnresearch.ca</a>. 
              </Message.Content>
            </Message>   
          </Segment>
        // </Fade>
        }
        <ProjectSearchInput/>
        <Divider hidden horizontal />
        {
          isActiveProjectKind('uploaded') ?
            <UploadedProjectsList onClick={(projectID) => dispatch(setProject({projectID}))}/>
          : isActiveProjectKind('public') ?
            <PublicProjectsList />
          : null
        }
      </Segment>
      </Fade>
      <CompareModal />
    </>
  )
}

export default ProjectsPageComponent