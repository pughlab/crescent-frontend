import React, {useState, useEffect} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'

import {Header, Button, Container, Divider, Message} from 'semantic-ui-react'

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
    <>
    <Container>
      <Divider horizontal
        content={
          <Header
            content={'CReSCENT: CanceR Single Cell ExpressioN Toolkit'}
            subheader={'Select a public project (below) or sign in (top right) to start'}
          />
        }
      />

      {/* Only show public projects if guest */}
      <Button.Group size='mini' fluid
        widths={isGuest ? 1 : 2}
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
        {
          R.not(isGuest) &&
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
        }
      </Button.Group>
      <Divider hidden horizontal />
      {
        isActiveProjectKind('uploaded') ? <UploadedProjectsList />
        : isActiveProjectKind('published') ? <PublicProjectsList />
        : null
      }
    </Container>
    </>
  )
})


export default ProjectsCardList