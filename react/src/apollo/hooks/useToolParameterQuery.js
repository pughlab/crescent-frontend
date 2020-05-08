import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useToolParameterQuery(parameter) {
  const [toolParameter, setToolParameter] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query ToolParameter($parameter: String) {
      toolParameter(parameter: $parameter) {
        parameter
        label
        prompt
        description
        input
        disabled
      }
    }
  `, {
    variables: {
      parameter
    },
    onCompleted: ({toolParameter}) => {
      if (RA.isNotNil(toolParameter)) {
        setToolParameter(toolParameter)
      }
    }
  })
  return toolParameter
}