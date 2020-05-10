import React from 'react'

import {Input, Segment, Dropdown} from 'semantic-ui-react'

import {useDispatch} from 'react-redux'

import {useProjectsPage} from '../../../redux/hooks'
import {setSearchFilter} from '../../../redux/actions/projectsPage'

const ProjectSearchInput = ({

}) => {
  const dispatch = useDispatch()
  const {searchFilter} = useProjectsPage()
  return (
    <>
    <Segment attached='bottom'>
      <Input fluid size='large'
        placeholder='Search project names and descriptions'
        value={searchFilter}
        // TODO: debounce
        onChange={ (e, {value}) => dispatch(setSearchFilter({value}))}
      />
    </Segment>
    </>
    
  )
}

export default ProjectSearchInput