import React from 'react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Segment, Header, Icon } from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import TOOLS from './TOOLS'
import { FloatParameterInput, IntegerParameterInput, RangeParameterInput, SelectParameterInput } from './ParameterInputs'

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
      // percentRibo,
      resolution,
      principalDimensions,
      normalizationMethod,
      applyCellFilters,
      returnThreshold,
    } = parameters
    // Disable changing parameters if run is not pending
    // Also disable segment below
    const mergeAndSetParameters = R.compose(
      setParameters,
      R.equals('pending', runStatus) ? R.mergeRight(parameters) : R.mergeLeft(parameters)
    )
    // TODO: redux action to set parameter key
    const valueSetters = {
      'sc_input_type': singleCell => mergeAndSetParameters({singleCell}),
      'number_genes': numberGenes => mergeAndSetParameters({numberGenes}),
      'percent_mito': percentMito => mergeAndSetParameters({percentMito}),
      // 'percent_ribo': percentRibo => mergeAndSetParameters({percentRibo}),
      'pca_dimensions': principalDimensions => mergeAndSetParameters({principalDimensions}),
      'resolution': resolution => mergeAndSetParameters({resolution}),
      'apply_cell_filters' : applyCellFilters => mergeAndSetParameters({applyCellFilters}),
      'normalization_method' : normalizationMethod => mergeAndSetParameters({normalizationMethod}),
      'return_threshold' : returnThreshold => mergeAndSetParameters({returnThreshold})
    }
    const values = {
      'sc_input_type': singleCell,
      'number_genes': numberGenes,
      'percent_mito': percentMito,
      // 'percent_ribo': percentRibo,
      'pca_dimensions': principalDimensions,
      'resolution': resolution,
      'apply_cell_filters': applyCellFilters,
      'normalization_method' : normalizationMethod, 
      'return_threshold' : returnThreshold
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
                const { parameter: parameterName, input: {type} } = parameter
                const setValue = R.prop(parameterName, valueSetters)
                const value = R.prop(parameterName, values)
                return R.cond([
                  [R.equals('range'), R.always(
                    <RangeParameterInput
                      {...{parameter, value, setValue}}
                    />
                  )],
                  [R.equals('float'), R.always(
                    <FloatParameterInput
                      {...{parameter, value, setValue}}
                    />
                  )],
                  [R.equals('integer'), R.always(
                    <IntegerParameterInput
                      {...{parameter, value, setValue
                      }}
                    />
                  )],
                  [R.equals('select'), R.always(
                    <SelectParameterInput
                      {...{parameter, value, setValue}}
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