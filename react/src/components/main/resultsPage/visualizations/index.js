import React from 'react'
import * as R from 'ramda'
import {Segment, Icon, Header, Image} from 'semantic-ui-react'
import Shake from 'react-reveal/Shake'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useResultsAvailableQuery} from '../../../../apollo/hooks'

import ScatterPlot from './ScatterPlot'
import ViolinPlot from './ViolinPlot'
import QCPlot from './QCPlot'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'


const VisualizationsComponent = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)

  const dispatch = useDispatch()
  const {activeResult} = useResultsPage()

  if (R.any(R.isNil, [run])) {
    return null
  }

  const {status: runStatus} = run

  const isActiveResult = R.equals(activeResult)

  return (
    <>
    {
      R.equals('submitted', runStatus) ?
        <Segment style={{height: '100%'}} color='violet'>
          <Segment style={{height: '100%'}} basic placeholder>
            <Tada forever duration={1000}>
              <Image src={Logo} centered size='medium' />
            </Tada>
          </Segment>
        </Segment>
      :
      // ... otherwise visualize results
        R.ifElse(
          R.isNil,
          R.always(
            <Segment color='violet' placeholder>
              <Shake forever duration={10000}>
              <Header textAlign='center' icon>
                <Icon name='right arrow' />
                Select a visualization on the right
              </Header>  
              </Shake>      
            </Segment>
          ),
          R.always(
            <>
            <Segment style={{height: '60vh'}} color='violet'>
              {
                isActiveResult('qc') ? <QCPlot />
                : isActiveResult('violin') ? <ViolinPlot />
                : (isActiveResult('tsne') || isActiveResult('umap')) && <ScatterPlot />
              }
            </Segment>
            {/* <Segment style={{height: '60vh'}} color='violet'>
              {
                isActiveResult('qc') ? <QCPlot />
                : isActiveResult('violin') ? <ViolinPlot />
                : (isActiveResult('tsne') || isActiveResult('umap')) && <ScatterPlot />
              }
            </Segment>
            <Segment style={{height: '60vh'}} color='violet'>
              {
                isActiveResult('qc') ? <QCPlot />
                : isActiveResult('violin') ? <ViolinPlot />
                : (isActiveResult('tsne') || isActiveResult('umap')) && <ScatterPlot />
              }
            </Segment>
            <Segment style={{height: '60vh'}} color='violet'>
              {
                isActiveResult('qc') ? <QCPlot />
                : isActiveResult('violin') ? <ViolinPlot />
                : (isActiveResult('tsne') || isActiveResult('umap')) && <ScatterPlot />
              }
            </Segment> */}

            </>
          )
        )(activeResult)
      }
      </>
  )
}

export default VisualizationsComponent