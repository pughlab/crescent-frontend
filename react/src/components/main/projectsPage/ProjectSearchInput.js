import React from 'react'
import * as R from 'ramda'
import {Input, Segment, Dropdown, Grid, Button} from 'semantic-ui-react'

import {useDispatch} from 'react-redux'

import {useProjectsPage} from '../../../redux/hooks'
import {setSearchFilter, setTissueFilter, setOncotreeFilter} from '../../../redux/actions/projectsPage'

import {useOncotreeQuery} from '../../../apollo/hooks'

const ProjectSearchInput = ({

}) => {
  const oncotree = useOncotreeQuery()

  const dispatch = useDispatch()
  const {searchFilter, tissueFilter, oncotreeFilter} = useProjectsPage()

  if (R.isNil(oncotree)) {
    return null
  }

  const {tissue: tissueTypes} = oncotree

  const {cancer, nonCancer} = tissueFilter
  return (
    <Segment attached='bottom' color='black' as={Grid} verticalAlign='middle'>
      <Grid.Column width={16}>
        <Input fluid size='large'
          placeholder='Search project names and descriptions'
          value={searchFilter}
          // TODO: debounce
          onChange={ (e, {value}) => dispatch(setSearchFilter({value}))}
        />
      </Grid.Column>
      <Grid.Column width={8}>
        <Button.Group widths={2}>
          <Button
            active={cancer}
            color={'black'}
            basic={R.not(cancer)}
            content='Cancer'
            onClick={() => dispatch(setTissueFilter({cancer: R.not(cancer), nonCancer}))}
          />
          <Button
            active={nonCancer}
            color={'black'}
            basic={R.not(nonCancer)}
            content='Non-cancer'
            onClick={() => dispatch(setTissueFilter({cancer, nonCancer: R.not(nonCancer)}))}
          />
        </Button.Group>
      </Grid.Column>
      <Grid.Column width={8}>
        <Dropdown fluid
          selection
          multiple
          search
          placeholder='Select tissue type'
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
    
  )
}

export default ProjectSearchInput