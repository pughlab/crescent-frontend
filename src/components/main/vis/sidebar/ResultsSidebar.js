import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../../redux/hoc'

const ResultsSidebar = withRedux(
  ({
    app: {
      run: {runID},
      toggle: {vis: {results: {activeResult, availableResults}}}
    },
    actions: {
      toggle: {
        setAvailableResults,
        setActiveResult
      }
    }
  }) => {
    useEffect(() => {
      fetch(`/metadata/plots/${runID}`)
      .then(resp => resp.json())
      .then(({plots}) => {setAvailableResults(plots)})
    }, [runID])
    const isActiveResult = R.equals(activeResult)
    return (
      R.isNil(activeResult) ?
        <Step.Group vertical fluid size='small'>
        {
          R.map(
            ({result, label, description}) => (
              <Step key={result}
                onClick={() => setActiveResult(result)}
              >
                {
                  isActiveResult(result)
                  && <Icon name='eye' color='violet'/>
                }
                <Step.Content title={label} description={description} />
              </Step>
            ),
            availableResults
          )
        }
        </Step.Group>
      :
        <Segment>
          <Button color='violet' fluid onClick={() => setActiveResult(null)} animated='fade'>
            <Button.Content visible>
            {
              R.compose(
                R.prop('label'),
                R.find(R.propEq('result', activeResult))
              )(availableResults)
            }
            </Button.Content>
            <Button.Content hidden>
              <Icon name='angle left' />
              Click to go back
            </Button.Content>
          </Button>
          <Divider />
          Put visualization menu here
        </Segment>
    )
  }
)

export default ResultsSidebar