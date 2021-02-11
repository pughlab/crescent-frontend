import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useOncotreeQuery() {
  const [oncotree, setOncotree] = useState(null)
  const {data, loading, error} = useQuery(gql`
    query {
      oncotree {
        version
        tissue {
          name
          code
        }
      }
    }
  `, {
    onCompleted: ({oncotree}) => {
      if (RA.isNotNil(oncotree)) {
        setOncotree(oncotree)
      }
    }
  })
  return oncotree
}