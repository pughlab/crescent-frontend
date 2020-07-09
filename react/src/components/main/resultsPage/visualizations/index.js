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

  const plots = useResultsAvailableQuery(runID)

  if (R.any(R.isNil, [run, plots])) {
    return null
  }

  const {status: runStatus} = run

  const determinePlotType = R.cond([
    [R.equals('violin'), R.always(<ViolinPlot/>)],
    [R.equals('qc'), R.always(<QCPlot/>)],
    [R.equals('tsne'), R.always(<ScatterPlot/>)],
    [R.equals('umap'), R.always(<ScatterPlot/>)]
  ])

  return (
    <>
    {
      R.equals('submitted', runStatus) ?
        <Segment style={{height: '100%'}} placeholder>
          <Tada forever duration={1000}>
            <Image src={Logo} centered size='medium' />
          </Tada>
          <Header content='' textAlign='center' />  
        </Segment>
      :
      // ... otherwise visualize results
        R.ifElse(
          R.isNil,
          R.always(
            <Segment style={{height: '100%'}} placeholder>
              <Shake forever duration={10000}>
              <Header textAlign='center' icon>
                <Icon name='right arrow' />
                Select a visualization on the right
              </Header>  
              </Shake>      
            </Segment>
          ),
          R.always(
            <Segment style={{height: '100%'}}>
              {determinePlotType(activeResult)}
            </Segment>
          )
        )(activeResult)
      }
      </>
  )
}

export default VisualizationsComponent

//   if (R.equals('submitted', runStatus)) {
//     return (
//       <Segment style={{height: '100%'}}>
//         <Segment style={{height: '100%'}} basic placeholder>
//           <Tada forever duration={1000}>
//             <Image src={Logo} centered size='medium' />
//           </Tada>
//           <Header content='' textAlign='center' />
//         </Segment>
//       </Segment>
//     )
//   }
//   return (
//     <Segment style={{height: '100%'}} color='violet'>      
//     </Segment>
//   )
// }

// export default VisualizationsComponent