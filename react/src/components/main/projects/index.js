import React from 'react';
import * as R from 'ramda'

import { Header, Button, Container, Divider } from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import UploadedProjectsList from './UploadedProjectsList'
import PublicProjectsList from './PublicProjectsList'


const ProjectsCardList = withRedux(({
  app: {
    view: {isGuest},
    toggle: {projects: {activeKind: activeProjectKind}}
  },
  actions: {
    toggle: {setActiveProjectKind}
  }
}) => {
  const isActiveProjectKind = R.equals(activeProjectKind)
  return (
    <Container>
      <Divider horizontal
        content={
          <Header
            size='large'
            content={'PROJECTS'}
            subheader={'Select a public project or upload data to begin'}
          />
        }
      />
      {/* Only show public projects if guest */}
      <Button.Group fluid
        widths={2}
      >
        <Button color='black'
          onClick={() => setActiveProjectKind('published')}
          active={isActiveProjectKind('published')} 
          basic={R.not(isActiveProjectKind('published'))}
        >
          <Header
            inverted={isActiveProjectKind('published')}
            content='Public Data' subheader='Published/example datasets accepted by CReSCENT'
          />
        </Button>
        <Button color='black'
          onClick={() => setActiveProjectKind('uploaded')}
          active={isActiveProjectKind('uploaded')} 
          basic={R.not(isActiveProjectKind('uploaded'))}
        >
          <Header
            inverted={isActiveProjectKind('uploaded')}
            content='Uploaded Data' subheader='Upload your own scRNA-seq data'
          />
        </Button>
      </Button.Group>
      <Divider hidden horizontal />
      {
        isActiveProjectKind('uploaded') ? <UploadedProjectsList />
        : isActiveProjectKind('published') ? <PublicProjectsList />
        : null
      }
    </Container>
  )
})


export default ProjectsCardList