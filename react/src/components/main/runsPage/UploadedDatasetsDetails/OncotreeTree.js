import React, {useState, useEffect, useReducer} from 'react';

import {Container, Breadcrumb, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Step, Transition, Form} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'


import {useOncotreeSunburstQuery} from '../../../../apollo/hooks/dataset'

import Tree from 'react-tree-graph'

import 'react-tree-graph/dist/style.css'

function useOncotreeTreeReducer() {
  // Use query hook to process raw oncotree JSON to react-vis sunburst tree
  const {oncotree, tissues} = useOncotreeSunburstQuery()
  // Use reducer hook to control sunburst interactions
  const [state, dispatch] = useReducer((state, action) => {
    const {type, payload} = action
    switch (type) {
      // Dropdown filters 
      case 'setFilterTissues':
        const {value} = payload
        return R.evolve({
          filterTissues: R.always(value)
        })(state)
      case `resetFilterTissues`:
        return R.evolve({
          filterTissues: R.always([])
        })(state)

      // Hovered node
      case 'setHoveredNode':
        return R.evolve({
          hoveredNode: R.always(payload.node)
        })(state)
      case 'resetHoveredNode':
        return R.evolve({
          hoveredNode: R.always(null)
        })(state)

      // Clicked node
      case 'setClickedNode':
        console.log('clicked node', payload.node)
        return R.evolve({
          clickedNode: R.always(payload.node)
        })(state)
      case 'resetClickedNode':
        return R.evolve({
          clickedNode: R.always(null)
        })(state)
    }
  }, {
    filterTissues: [],
    hoveredNode: null,
    clickedNode: null
  })

  // Depending on reducer state, transform sunburst data as necessary
  const [sunburstData, setSunburstData] = useState(null)
  useEffect(() => {
    if (RA.isNotNil(oncotree)) {
      const {filterTissues, clickedNode} = state
      if (R.isNil(clickedNode)) {
        const sunburstData = R.compose(
          // If no filters then render entire tree
          R.isEmpty(filterTissues) ? R.identity : R.evolve({
            children: R.filter(R.compose(
              R.includes(R.__, filterTissues),
              R.prop('title')
            ))
          })
        )(oncotree)
        setSunburstData(sunburstData)
      } else {
        // console.log('tissue ancestor', getTissueAncestorNode(clickedNode))
        // const sunburstData = R.compose(
        //   // If no filters then render entire tree
        //   R.evolve({
        //     children: R.filter(R.compose(
        //       R.equals(R.__, getTissueAncestorNode(clickedNode).title),
        //       R.prop('title')
        //     ))
        //   })
        // )(oncotree)
        // console.log(sunburstData)
        // setSunburstData(sunburstData)
      }
    }

  }, [oncotree, state])

  return {oncotree, tissues, state, dispatch, sunburstData}
}

export default function OncotreeTree ({

}) {
  const {tissues, state, dispatch, sunburstData, oncotree} = useOncotreeTreeReducer()
  const {filterTissues, hoveredNode, clickedNode} = state
  if (R.any(R.isNil, [sunburstData])) {
    return null
  }

  console.log(oncotree)

  const data = R.compose(
    R.evolve({
      children: R.drop(3)
    })
  )(oncotree)

  return (
    <Segment textAlign='center'>
      <Segment>
      <Form>
        form
      </Form>
      </Segment>

      <div style={{overflowX: 'scroll'}}>
        <Tree
          // data={oncotree}
          {...{data}}
          height={window.innerHeight/2}
          width={window.innerWidth/2}
          animated
        />
      </div>
    </Segment>
  )
}
