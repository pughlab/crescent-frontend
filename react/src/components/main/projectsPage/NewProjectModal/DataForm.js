import React, {useState, useCallback, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../../utils'

import {useDropzone} from 'react-dropzone'

import {Form, Card, Header, Menu, Button, Segment, Modal, Label, Divider, Icon, Image, Popup, Grid, Step} from 'semantic-ui-react'

import {useCrescentContext} from '../../../../redux/hooks'

import DirectoryUploadSegment from './DirectoryUploadSegment'
import {PublicProjects, UploadedProjects} from './ExistingProjects'


const DataForm = ({
  // Props
  newProjectState, newProjectDispatch,
}) => {
  const {userID} = useCrescentContext()
  const [currentContent, setCurrentContent] = useState('publicProjects')
  const CONTENTS = [
    {
      name: 'publicProjects',
      label: 'Public Projects',
      icon: 'folder open',
      component: (
        <PublicProjects
          {...{newProjectState, newProjectDispatch}}
        />
      )
    },
    {
      name: 'uploadedProjects',
      label: 'Your Projects',
      icon: 'folder open',
      component: (
        <UploadedProjects
          {...{newProjectState, newProjectDispatch}}
        />
      )
    },
    {
      name: 'directoryUpload',
      label: 'Upload Datasets',
      icon: 'upload',
      component: (
        <DirectoryUploadSegment 
          {...{newProjectState, newProjectDispatch}}
        />
      )
    },
    
  ]
  return (
    <>
      <Button.Group widths={3} fluid>
      {
        R.map(
          ({name, label, icon}) => (
            <Button key={name} content={label} onClick={() => setCurrentContent(name)}
              active={R.equals(currentContent, name)}
            />
          ),
          CONTENTS
        )
      }
      </Button.Group>

      <Divider horizontal />
      {
        R.compose(
          R.prop('component'),
          R.find(R.propEq('name', currentContent))
        )(CONTENTS)
      }
    </>
  )
}

export default DataForm