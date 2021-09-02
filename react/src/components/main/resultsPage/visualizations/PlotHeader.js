import React from 'react'
import { Header, Popup, Grid, Button } from 'semantic-ui-react'

import * as R from 'ramda'

import { useDispatch } from 'react-redux'
import { useCrescentContext, useResultsPage } from '../../../../redux/hooks'
import { useRunDetailsQuery } from '../../../../apollo/hooks/run'
import { goToResults } from '../../../../redux/actions/context'
import { cacheComparePage } from '../../../../redux/actions/comparePage'

const PlotHeader = ({
  plotQueryID,
  name,
  runID // need to be passed down since each plot has different runID in compare page
}) => {
  const { view, userID: currUserID } = useCrescentContext()
  const {plotQueries} = useResultsPage()

  const dispatch = useDispatch()
  const run = useRunDetailsQuery(runID)
  if (R.any(R.isNil, [run])) {
    return <Header textAlign="center">{name}</Header>
  }

  const {createdBy: {userID: runOwnerID}} = run
 
  return R.equals(view, 'compare') ? (
    <Grid columns={1} centered >
      <Grid.Column textAlign="center"  >
        <Header style={{display: "inline-block", margin:"auto"}}>{name}</Header>
        {
          R.equals(currUserID, runOwnerID) && 
          <Popup
            trigger={ 
              <Button size="large" style={{margin: "0 0 0 5px", padding: '7px'}} icon='external square'
                onClick={() => { 
                  dispatch(cacheComparePage({plotQueryID, plotQueries}))
                  dispatch(goToResults({runID}))
                }} 
              />
            }
            inverted
            content="Edit Plot"
          />
        }
      </Grid.Column>
    </Grid>
    ) : (
      <Header textAlign="center">{name}</Header>
    )
}

export default PlotHeader
