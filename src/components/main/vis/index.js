import React, {useState, useEffect, useRef} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Segment, Transition, Grid, Image, Message, Header, Label } from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import SidebarComponent from './sidebar'
import ParametersComponent from './parameters'
import ResultsComponent from './results'


import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const VisComponent = withRedux(
  ({
    app: {
      run: {
        runID
      },
      view: {main: mainView, sidebar: sidebarView},
      toggle: {
        vis: {
          pipeline: {
            isSubmitted
          }
        }
      }
    },
  }) => {
    const [deleteRun, {data, loading, error}] = useMutation(gql`
      mutation DeleteRun($runID: ID!) {
        deleteRun(runID: $runID) {
          runID
        }
      }
    `, {
      variables: {runID},
      onCompleted: data => {
        // refetch()
        console.log(data)
      }
    })

    // In case we want to delete unsubmitted runs
    useEffect(() => () => {
      if (R.not(isSubmitted)) {
        console.log('not submitted')
        // deleteRun()
      } else {
        console.log('submitted')
      }
    }, [])
    return (
      <>
      <Grid style={{minHeight: 'calc(100vh - 12rem - 2px)'}}>
        <Grid.Column width={11} style={{minHeight: '100%'}}>
          <Transition visible animation='fade right' duration={1000} unmountOnHide={true} transitionOnMount={true}>
          <Segment style={{height: '100%'}}
            color={
              R.cond([
                [R.equals('pipeline'), R.always('blue')],
                [R.equals('results'), R.always('violet')],
              ])(sidebarView)
            }
          >
          {
            R.cond([
              [R.equals('pipeline'), R.always(
                <ParametersComponent />
              )],
              [R.equals('results'), R.always(
                <ResultsComponent />
              )],
            ])(sidebarView)
          }
          </Segment>
          </Transition>
        </Grid.Column>
        <Grid.Column width={5} style={{minHeight: '100%'}}>
          <SidebarComponent />
        </Grid.Column>
      </Grid>
      </>
    )
  }
)

export default VisComponent
