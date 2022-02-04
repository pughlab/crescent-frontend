import React, {useState} from 'react'
import {Button, Divider} from 'semantic-ui-react'
import * as R from 'ramda'

import DirectoryUploadSegment from './DirectoryUploadSegment'
import {PublicProjects, UploadedProjects} from './ExistingProjects'

const DataForm = () => {
  const [currentContent, setCurrentContent] = useState('publicProjects')
  const CONTENTS = [
    {
      name: 'publicProjects',
      label: 'Public Projects',
      component: (
        <PublicProjects />
      )
    },
    {
      name: 'uploadedProjects',
      label: 'Your Projects',
      component: (
        <UploadedProjects />
      )
    },
    {
      name: 'directoryUpload',
      label: 'Upload Datasets',
      component: (
        <DirectoryUploadSegment />
      )
    }
  ]
  
  return (
    <>
      <Button.Group fluid widths={3}>
      {
        R.map(
          ({name, label}) => (
            <Button
              key={name}
              active={R.equals(currentContent, name)}
              content={label}
              onClick={() => setCurrentContent(name)}
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