import React, {useState, useEffect} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Header, Button, Container, Divider} from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import UploadedProjectsList from './UploadedProjectsList'
import PublicProjectsList from './PublicProjectsList'


const ProjectsCardList = withRedux(({
  app: {
    // user: {projects: userProjects},
    user,
    toggle: {projects: {activeKind: activeProjectKind}}
  },
  actions: {
    toggle: {setActiveProjectKind}
  }
}) => {
  const isActiveProjectKind = R.equals(activeProjectKind)
  return (
    <Container>
      <Divider content='Viewing Projects' horizontal/>
      <Button.Group size='mini' fluid widths={2}>
        <Button
          onClick={() => setActiveProjectKind('published')}
          active={isActiveProjectKind('published')} 
        >
          <Header content='Public Data' subheader='Published/example datasets accepted by CReSCENT' />
        </Button>
        <Button
          disabled={R.isNil(user)}
          onClick={() => setActiveProjectKind('uploaded')}
          active={isActiveProjectKind('uploaded')} 
        >
          <Header content='Uploaded Data' subheader={R.isNil(user) ? 'Register and sign in to upload your own data' : 'Upload your own scRNA-seq data'} />
        </Button>
      </Button.Group>
      <Divider hidden />
      {
        isActiveProjectKind('uploaded') ? <UploadedProjectsList />
        : isActiveProjectKind('published') ? <PublicProjectsList />
        : null
      }
    </Container>
  )
})


export default ProjectsCardList