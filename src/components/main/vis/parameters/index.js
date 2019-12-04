import React, {useState} from 'react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Transition, Menu, Segment, Button, Label, Divider, Dropdown, Header, Icon, Message} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import PARAMETERS from './PARAMETERS'
import {
  SingleCellInputType,
  NumberGenes,
  PercentMito,
  Resolution,
  PCADimensions,
} from './Inputs'

const ParametersComponent = withRedux(
  ({
    app: {
      run: {
        runID,
        status: runStatus
      },
      toggle: {
        vis: {
          pipeline: {
            activeStep: activePipelineStep,
            parameters,
          }
        }
      }
    },
    actions: {
      setParameters
    }
  }) => {
    console.log(parameters)
    const {
      singleCell,
      numberGenes,
      percentMito,
      resolution,
      principalDimensions,
    } = parameters
    // Disable changing parameters if run is not pending
    const mergeAndSetParameters = R.compose(
        setParameters,
        R.equals('pending', runStatus) ? R.mergeRight(parameters) : R.mergeLeft(parameters)
      )      

    const setSingleCell = singleCell => mergeAndSetParameters({singleCell})
    const setNumberGenes = numberGenes => mergeAndSetParameters({numberGenes})
    const setPercentMito = percentMito => mergeAndSetParameters({percentMito})
    const setResolution = resolution => mergeAndSetParameters({resolution})
    const setPrincipalDimensions = principalDimensions => mergeAndSetParameters({principalDimensions})

    const isActivePipelineStep = R.equals(activePipelineStep)
       
    const stepHasNoParameter = R.compose(
      R.and(RA.isNotNil(activePipelineStep)),
      R.isEmpty,
      R.filter(R.propEq('step', activePipelineStep))
    )(PARAMETERS)

    if (R.isNil(activePipelineStep)) {
      return (
        <Segment basic placeholder>
          <Header textAlign='center' icon>
            <Icon name='right arrow' />
            {
              R.equals('pending', runStatus) ?
                'Select a pipeline step on the right to configure parameters'
              :
                'Parameters have already been configured and job submitted'
            }
          </Header>
        </Segment>
      )
    }
    if (stepHasNoParameter) {
      return (
        <Segment basic placeholder>
          <Header textAlign='center' icon>
            <Icon name='dont' />
            Step has no parameters
          </Header>
        </Segment>
      )
    }
    return (
      <>
      {
        R.not(R.equals('pending', runStatus)) &&
          <Message
            color={R.prop(runStatus, {submitted: 'yellow', completed: 'green'})}
          >
            <Message.Header as={Header} size='large'
              content={`Run is ${runStatus} and so parameters are not configurable`}
            />
            <Message.Header as={Header} size='large'
              content={R.prop(runStatus, {submitted: 'You will be notified when your run is complete', completed: "Click 'Results' on the right to view visualizations"})}
            />
          </Message>
      }
      <Segment basic>
      {
        isActivePipelineStep('quality') ?
          <>
            <SingleCellInputType {...{singleCell, setSingleCell}} />
            <Divider />
            <NumberGenes {...{numberGenes, setNumberGenes}} />
            <Divider />
            <PercentMito {...{percentMito, setPercentMito}} />
          </>
        : isActivePipelineStep('reduction') ?
          <PCADimensions {...{principalDimensions, setPrincipalDimensions}} />
        : isActivePipelineStep('clustering') ?
          <Resolution {...{resolution, setResolution}} />
        : null
      }
      </Segment>
      </>
    )
  }
)

export default ParametersComponent