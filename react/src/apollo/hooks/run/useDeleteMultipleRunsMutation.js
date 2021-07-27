import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { gql } from 'apollo-boost'

export default function useDeleteMultipleRunsMutation() {

    const [deleteMultipleRuns, { loading, data, error }] = useMutation(gql`
    mutation DeleteMultipleRuns($runIDs: [ID]) {
        deleteMultipleRuns(runIDs: $runIDs) {
            name
      }
    }
  `)

    return { deleteMultipleRuns, loading, data }
}