import React from 'react'
import * as R from 'ramda'

import {Segment, Image, Header, Icon} from 'semantic-ui-react'

import PipelineParameter from './PipelineParameter'
import QualityControlParametersComponent from './QualityControl'
import ReferenceDatasets from '../data/ReferenceDatasets'

import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useToolStepsQuery} from '../../../../apollo/hooks/run'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import Shake from 'react-reveal/Shake'

const ParametersComponent = () => {
  const {runID} = useCrescentContext()
  const {run} = useRunDetailsQuery(runID)
  const {activePipelineStep, runStatus} = useResultsPage()
  const toolSteps = useToolStepsQuery()

  if (R.any(R.isNil, [run, toolSteps])) {
    return (
      <Segment style={{height: '100%'}} color='violet'>
        <Segment basic style={{ height: '100%' }} placeholder>
          <Tada forever duration={1000}>
            <Image src={Logo} centered size='medium' />
          </Tada>
        </Segment>
      </Segment>
    )
  }


  const {datasets} = run

  const isSingleDataset = R.compose(R.equals(1), R.length)(datasets)

  if (R.isNil(activePipelineStep)) {
    return (
      <Segment placeholder style={{height: '100%'}} color='blue'>
        <Shake forever duration={10000}>
        <Header textAlign='center' icon>
          <Icon name='right arrow' />
          {
            R.ifElse(
              R.equals('pending'),
              R.always('Select a pipeline step on the right to configure parameters'),
              R.always('Parameters have already been configured and job submitted')
            )(runStatus)
          }
        </Header>
        </Shake>
      </Segment>
    )
  }

  const activePipelineStepData = R.find(R.propEq('step', activePipelineStep), toolSteps)

  return (
    <Segment style={{height: '100%'}} color='blue'>
    {
      R.equals('referenceDatasets', activePipelineStep) ? 
        <ReferenceDatasets {...{runID}} />      
      : R.equals('quality', activePipelineStep) ? 
        <QualityControlParametersComponent />
      : 
        R.compose(
          R.ifElse(
            R.isEmpty, 
            R.always(
              <Segment basic placeholder style={{height: '100%'}}>
                <Shake forever duration={10000}>
                  <Header textAlign='center' icon>
                    <Icon name='dont' />
                    {
                        `There are no user-editable ${R.prop('label', activePipelineStepData)} parameters for a ${isSingleDataset ? 'single' : 'multi'} sample pipeline`
                    }
                    {
                      R.and(R.equals('normalization', activePipelineStep), R.not(isSingleDataset)) && 
                      <Header.Subheader content='Normalization uses scTransform for a multi sample pipeline'/>
                    }
                  </Header>
                </Shake>
              </Segment>
            ), 
            R.map(
              ({parameter: parameterCode}) => (
                <PipelineParameter key={parameterCode} {...{parameterCode}} />
              )
            )
          ),
          R.filter(R.prop(isSingleDataset ? 'singleDataset' : 'multiDataset')),
          R.prop('parameters'),
          // R.find(R.propEq('step', activePipelineStep))
        )(activePipelineStepData)
    }
    </Segment>
  )
}

export default ParametersComponent