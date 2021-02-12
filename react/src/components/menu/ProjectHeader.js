import React from 'react'
import * as R from 'ramda'

import {Header} from 'semantic-ui-react'

import {useCrescentContext} from '../../redux/hooks'
import {useProjectDetailsQuery} from '../../apollo/hooks/project'

const ProjectHeader = ({

}) => {
  const {projectID} = useCrescentContext()
  const project = useProjectDetailsQuery(projectID)
  if (R.isNil(project)) {
    return null
  }

  const {name: projectName} = project
  return (    
    <Header
      textAlign='center'
      content={projectName}
    />
  )
}

export default ProjectHeader