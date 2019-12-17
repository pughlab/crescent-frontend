import React, {useState} from 'react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Transition, Menu, Segment, Button, Label, Divider, Dropdown, Header, Icon, Message} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import TOOLS from './TOOLS'
import ParameterInputs from './ParameterInputs'

// import PARAMETERS from './PARAMETERS'
import {
  SingleCellInputType,
  NumberGenes,
  PercentMito,
  Resolution,
  PCADimensions,
} from './Inputs'

const {FloatParameterInput, IntegerParameterInput, RangeParameterInput} = ParameterInputs

const ParametersComponent = withRedux(
  ({
    app: {
      user: {
        userID: currentUserID
      },
      run: {
        createdBy: {
          userID: creatorUserID
        },
        status: runStatus
      },
      toggle: {
        vis: {
          pipeline: {
            activeStep: activePipelineStep,
            parameters,
            isSubmitted,
          }
        }
      }
    },
    actions: {
      setParameters
    }
  }) => {
    const {
      singleCell,
      numberGenes,
      percentMito,
      resolution,
      principalDimensions,
    } = parameters
    // Disable changing parameters if run is not pending
    // Also disable segment below
    const mergeAndSetParameters = R.compose(
      setParameters,
      R.equals('pending', runStatus) ? R.mergeRight(parameters) : R.mergeLeft(parameters)
    )

    const setSingleCell = singleCell => mergeAndSetParameters({singleCell})
    const setNumberGenes = numberGenes => mergeAndSetParameters({numberGenes})
    const setPercentMito = percentMito => mergeAndSetParameters({percentMito})
    const setResolution = resolution => mergeAndSetParameters({resolution})
    const setPrincipalDimensions = principalDimensions => mergeAndSetParameters({principalDimensions})

    const valueSetters = {
      'number_genes': setNumberGenes,
      'percent_mito': setPercentMito,
      'pca_dimensions': setPrincipalDimensions,
      'resolution': setResolution
    }
    const values = {
      'number_genes': numberGenes,
      'percent_mito': percentMito,
      'pca_dimensions': principalDimensions,
      'resolution': resolution
    }

    const currentUserNotCreator = R.not(R.equals(currentUserID, creatorUserID))
    const runNotPending = R.compose(R.not, R.equals('pending'))(runStatus)

    if (R.isNil(activePipelineStep)) {
      return (
        <Segment basic placeholder style={{height: '100%'}}>
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

    return (
      <Segment basic
        disabled={R.any(RA.isTrue, [
          currentUserNotCreator,
          isSubmitted,
          runNotPending
        ])}
      >
        {
          R.compose(
            R.addIndex(R.map)(
              (parameter, index) => {
                const {parameter: parameterName, input: {type}, disabled} = parameter
                if (disabled) {
                  return (
                    <Segment>
                      Disabled
                    </Segment>
                  )
                }
                const setValue = R.prop(parameterName, valueSetters)
                const value = R.prop(parameterName, values)
                return R.cond([
                  [R.equals('range'), R.always(
                    <RangeParameterInput
                      {...{
                        parameter,
                        value,
                        setValue
                      }}
                    />
                  )],
                  [R.equals('float'), R.always(
                    <FloatParameterInput
                      {...{
                        parameter,
                        value,
                        setValue
                      }}
                    />
                  )],
                  [R.equals('integer'), R.always(
                    <IntegerParameterInput
                      {...{
                        parameter,
                        value,
                        setValue
                      }}
                    />
                  )],
                ])(type)
              },
            ),
            R.prop('parameters'),
            R.find(R.propEq('step', activePipelineStep)),
            R.prop('SEURAT')
          )(TOOLS)
        }
      </Segment>
    )
  }
)

export default ParametersComponent