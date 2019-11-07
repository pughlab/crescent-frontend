import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Divider, Step, Menu, Header, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../../redux/hoc'

import RESULTS from '../results/RESULTS'

const ResultsSidebar = withRedux(
  ({
    app: {
      toggle: {vis: {results: {activeResult, availableResults}}}
    },
    actions: {
      toggle: {setActiveResult}
    }
  }) => {
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
            RESULTS
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
              )(RESULTS)
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