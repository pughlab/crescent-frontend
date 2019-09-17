import React, {useState} from 'react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Grid, Menu, Segment, Button, Label, Divider, Dropdown, Header} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'
import {
  STEPS,
  PARAMETERS,
} from '../../main'
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
      toggle: {
        vis: {pipeline: {
          activeParameter: activePipelineParameter,
          activeStep: activePipelineStep
        }}
      },
      sidebar: {
        parameters
      }
    },
    actions: {
      setParameters,
      toggle: {setActivePipelineStep, setActivePipelineParameter}
    }
  }) => {
    const {
      singleCell,
      numberGenes,
      percentMito,
      resolution,
      principalDimensions,
    } = parameters
    const mergeAndSetParameters = R.compose(
      setParameters,
      R.mergeRight(parameters),
    )      
    const setSingleCell = singleCell => mergeAndSetParameters({singleCell})
    const setNumberGenes = numberGenes => mergeAndSetParameters({numberGenes})
    const setPercentMito = percentMito => mergeAndSetParameters({percentMito})
    const setResolution = resolution => mergeAndSetParameters({resolution})
    const setPrincipalDimensions = principalDimensions => mergeAndSetParameters({principalDimensions})

    const isActivePipelineStep = R.equals(activePipelineStep)
    const isActivePipelineParameter = R.equals(activePipelineParameter)
       
    const stepHasNoParameter = R.compose(
      R.and(RA.isNotNil(activePipelineStep)),
      R.isEmpty,
      R.filter(R.propEq('step', activePipelineStep))
    )(PARAMETERS)

    if (R.isNil(activePipelineStep)) {
      return (
        <Segment basic placeholder style={{height: '100%'}}>
          <Header textAlign='center' content='Select a pipeline step to configure parameters' />
        </Segment>
      )
    }
    return (
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column>
            <Button fluid as='div' labelPosition='left'>
              <Label color='blue' content='Step' />
              <Dropdown
                button
                fluid
                text={
                  R.compose(
                    R.prop('label'),
                    R.find(R.propEq('step', activePipelineStep))
                  )(STEPS)
                }
              >
                <Dropdown.Menu>
                {
                  R.map(
                    // prompt and description used for input components
                    ({step, label}) => (
                      <Dropdown.Item key={step}
                        active={isActivePipelineStep(step)}
                        onClick={() => setActivePipelineStep(step)}
                        content={label}
                      />
                    ),
                    STEPS
                  )
                }
                </Dropdown.Menu>
              </Dropdown>
            </Button>
          </Grid.Column>
          <Grid.Column>
          {
            stepHasNoParameter ?
              <Button fluid disabled color='blue' content='Step has no parameters' />
            :
              <Button fluid as='div' labelPosition='left'>
                <Label color='blue' content='Parameter' />
                <Dropdown
                  button
                  fluid
                  text={
                    R.compose(
                      R.prop('label'),
                      R.find(R.propEq('parameter', activePipelineParameter))
                    )(PARAMETERS)
                  }
                >
                  <Dropdown.Menu>
                  {
                    R.compose(
                      R.map(
                        // prompt and description used for input components
                        ({parameter, label, prompt, description}) => (
                          <Dropdown.Item key={parameter}
                            active={isActivePipelineParameter(parameter)}
                            onClick={() => setActivePipelineParameter(parameter)}
                            content={label}
                          />
                        )
                      ),
                      R.filter(R.propEq('step', activePipelineStep))
                    )(PARAMETERS)
                  }
                  </Dropdown.Menu>
                </Dropdown>
              </Button>
          }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={1}>
          <Grid.Column>
            <Segment basic >
            {
              isActivePipelineStep('quality') && (
                isActivePipelineParameter('sc_input_type') ?
                  <SingleCellInputType {...{singleCell, setSingleCell}} />
                : isActivePipelineParameter('number_genes') ?
                  <NumberGenes {...{numberGenes, setNumberGenes}} />
                : isActivePipelineParameter('percent_mito') ?
                  <PercentMito {...{percentMito, setPercentMito}} />
                : null
              )
            }
            {
              isActivePipelineStep('reduction')
              && isActivePipelineParameter('pca_dimensions')
              && <PCADimensions {...{principalDimensions, setPrincipalDimensions}} />
            }
            {
              isActivePipelineStep('clustering')
              && isActivePipelineParameter('resolution')
              && <Resolution {...{resolution, setResolution}} />
            }
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
)

export default ParametersComponent