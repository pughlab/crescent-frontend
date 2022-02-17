import {useState} from 'react'
import * as R from 'ramda'

import {Button, Divider} from 'semantic-ui-react'
import ProjectsList from './ProjectsList'

function ProjectsForm ({
  selectedProjectIDs, setSelectedProjectIDs, curatedProjects, uploadedProjects
}){
  const [currentContent, setCurrentContent] = useState('publicProjects')
  const ProjectsSubMenuContent = [
    {
      name: 'publicProjects',
      label: 'Public Projects',
      icon: 'folder open',
      component:
        <ProjectsList {...{selectedProjectIDs, setSelectedProjectIDs}} projects={curatedProjects} />
    },
    {
      name: 'uploadedProjects',
      label: 'Your Projects',
      icon: 'folder open',
      component:
        <ProjectsList {...{selectedProjectIDs, setSelectedProjectIDs}} projects={uploadedProjects} />
    },
  ]

  return (
    <>
      <Button.Group widths={3} fluid>
        {
          R.map(
            ({name, label}) => (
              <Button key={name} content={label} onClick={() => setCurrentContent(name)} active={R.equals(currentContent, name)}/>
            ),
            ProjectsSubMenuContent
          )
        }
      </Button.Group>
      <Divider horizontal />
      {
        R.compose(
          R.prop('component'),
          R.find(R.propEq('name', currentContent))
        )(ProjectsSubMenuContent)
      }
    </>
  )
}

export default ProjectsForm