import React, {useState, useEffect} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Header, Button, Segment, Divider} from 'semantic-ui-react'


import {useDispatch} from 'react-redux'
import {useProjectsPage} from '../../../redux/hooks'
import {setActiveProjectKind} from '../../../redux/actions/projectsPage'

import PublicProjectsList from './PublicProjectsList'
import UploadedProjectsList from './UploadedProjectsList'

const ProjectsPageComponent = ({

}) => {
  const dispatch = useDispatch()
  const {activeProjectKind} = useProjectsPage()
  const isActiveProjectKind = R.equals(activeProjectKind)
  return (
    <Segment basic>
      <Divider horizontal>
        <Header size='large' content={'PROJECTS'} subheader={'Select a public project or upload data to begin'} />
      </Divider>

      <Button.Group fluid widths={2}>
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
      <Divider hidden horizontal />
      {
        isActiveProjectKind('uploaded') ?
          
          <UploadedProjectsList />
        : isActiveProjectKind('public') ?
          <PublicProjectsList />
        : null
      }
    </Segment>
  )
}

export default ProjectsPageComponent