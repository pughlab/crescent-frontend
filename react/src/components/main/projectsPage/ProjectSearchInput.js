import React, {useState} from 'react'
import * as R from 'ramda'
import {Input, Segment, Dropdown, Grid, Button, Divider, Form, Checkbox} from 'semantic-ui-react'

import {useDispatch} from 'react-redux'

import {useProjectsPage} from '../../../redux/hooks'
import {setSearchFilter, setTissueFilter, setOncotreeFilter} from '../../../redux/actions/projectsPage'

import {useOncotreeQuery} from '../../../apollo/hooks'

import NewProjectModel from './NewProjectModal'

import Fade from 'react-reveal/Fade'

const ProjectSearchInput = ({

}) => {
  const [show, setShow] = useState(false)
  
  const oncotree = useOncotreeQuery()

  const dispatch = useDispatch()
  const {activeProjectKind, searchFilter, tissueFilter, oncotreeFilter} = useProjectsPage()

  if (R.isNil(oncotree)) {
    return null
  }

  const {tissue: tissueTypes} = oncotree

  const {cancer, nonCancer} = tissueFilter

  
  return (
    <Segment attached='bottom' as={Segment.Group} verticalAlign='middle'>
      <Segment>
        <Input fluid
          placeholder='Search project names and descriptions'
          value={searchFilter}
          // TODO: debounce
          onChange={ (e, {value}) => dispatch(setSearchFilter({value}))}
        />
      </Segment>

      <Segment as={Grid}>
        <Grid.Column width={6}>
        <Button.Group widths={2} fluid size='small'>
          <Button
            active={cancer}
            color={'black'}
            basic
            onClick={() => dispatch(setTissueFilter({cancer: R.not(cancer), nonCancer}))}
          >
            <Checkbox slider checked={cancer} label={'Cancer'} />
          </Button>
          <Button
            active={nonCancer}
            color={'black'}
            basic
            onClick={() => dispatch(setTissueFilter({cancer, nonCancer: R.not(nonCancer)}))}
          >
            <Checkbox slider checked={nonCancer} label='Non-cancer' />
          </Button>
        </Button.Group>
        </Grid.Column>
        <Grid.Column width={10}>
          <Dropdown fluid
            selection
            multiple
            search
            placeholder='Select Oncotree tissue type'
            options={
              R.map(
                ({code, name}) => ({
                  key: code,
                  value: code,
                  text: name
                }),
                tissueTypes
              )
            }
            value={oncotreeFilter}
            onChange={(e, {value}) => dispatch(setOncotreeFilter({codes: value}))}
          />
        </Grid.Column>
      </Segment>
    </Segment>
    
  )
}

export default ProjectSearchInput