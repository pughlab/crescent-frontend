import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useToolStepsQuery() {
  const [toolSteps, setToolSteps] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query ToolSteps {
      toolSteps {
        step
        label
        parameters {
          parameter
          singleDataset
          multiDataset
        }
      }
    }
  `, {
    onCompleted: ({toolSteps}) => {
      if (RA.isNotNil(toolSteps)) {
        setToolSteps(toolSteps)
      }
    }
  })
  return toolSteps
}