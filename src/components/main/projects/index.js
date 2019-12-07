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
    <>
    {/* <Message>
      <Message.Header as={Header}>
        CanceR Single Cell ExpressioN Toolkit
      </Message.Header>
      <Message.Content>
        Select a public project (below) or sign in (top right) to start
      </Message.Content>
    </Message> */}
    <Container>
      <Divider horizontal content='CReSCENT: CanceR Single Cell ExpressioN Toolkit' />

      <Button.Group size='mini' fluid
        widths={R.isNil(user) ? 1 : 2}
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
          RA.isNotNil(user) &&
            <Button color='black'
              disabled={R.isNil(user)}
              onClick={() => setActiveProjectKind('uploaded')}
              active={isActiveProjectKind('uploaded')} 
              basic={R.not(isActiveProjectKind('uploaded'))}
            >
              <Header
                inverted={isActiveProjectKind('uploaded')}
                content='Uploaded Data' subheader={R.isNil(user) ? 'Register and sign in to upload your own data' : 'Upload your own scRNA-seq data'}
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