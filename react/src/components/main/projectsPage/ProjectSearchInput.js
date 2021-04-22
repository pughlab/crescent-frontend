import React, {useState} from 'react'
import * as R from 'ramda'
import {Input, Segment, Dropdown, Grid, Button, Divider, Form, Checkbox, Popup} from 'semantic-ui-react'

import {useDispatch} from 'react-redux'

import {useProjectsPage} from '../../../redux/hooks'
import {setSearchFilter, setTissueFilter, setOncotreeFilter} from '../../../redux/actions/projectsPage'

import {useOncotreeQuery} from '../../../apollo/hooks/dataset'

import Fade from 'react-reveal/Fade'

const ProjectSearchInput = ({

}) => {
  const oncotree = useOncotreeQuery()

  const dispatch = useDispatch()
  const {activeProjectKind, searchFilter, tissueFilter, oncotreeFilter} = useProjectsPage()

  if (R.isNil(oncotree)) {
    return null
  }

  const {tissue: tissueTypes} = oncotree

  const {cancer, nonCancer} = tissueFilter

  
  return (
    // <Fade down appear={true} spy={activeProjectKind}>
    <Segment attached='bottom' as={Segment.Group} verticalalign='middle'>
      <Segment>
        <Input fluid
          placeholder='Search project names and descriptions'
          value={searchFilter}
          // TODO: debounce
          onChange={ (e, {value}) => dispatch(setSearchFilter({value}))}
        />
      </Segment>

      <Segment as={Grid}>
        <Grid.Column width={1}>
          <Popup
            trigger={
              <Button fluid icon='close' color='red' basic
                onClick={() => {
                  dispatch(setTissueFilter({cancer: true, nonCancer: true}))
                  dispatch(setOncotreeFilter({codes: []}))
                }}
              />
            }
            content='Reset tissue filters'
          />
        </Grid.Column>
        <Grid.Column width={5}>
        <Button.Group widths={2} fluid size='small'>
          <Button
            active={cancer}
            color={'pink'}
            basic
            onClick={() => dispatch(setTissueFilter({cancer: R.not(cancer), nonCancer}))}
          >
            <Checkbox slider checked={cancer} label={'Cancer'} />
          </Button>
          <Button
            active={nonCancer}
            color={'purple'}
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
    // </Fade>
  )
}

export default ProjectSearchInput