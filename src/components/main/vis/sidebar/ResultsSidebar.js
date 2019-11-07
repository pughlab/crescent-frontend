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
    )
  }
)

export default ResultsSidebar