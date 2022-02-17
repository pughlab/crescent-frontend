import {useState, useEffect, useReducer} from 'react';

import {Container, Breadcrumb, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Step, Transition, Form} from 'semantic-ui-react'

import {Sunburst, LabelSeries} from 'react-vis'
import './Sunburst.css'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'


import {useOncotreeSunburstQuery} from '../../../../apollo/hooks/dataset'

// https://github.com/uber/react-vis/blob/premodern/showcase/sunbursts/basic-sunburst.js
function getKeyPath(node) {
  if (!node.parent) {
    return ['root'];
  }

  return [(node.data && node.data.name) || node.name].concat(
    getKeyPath(node.parent)
  );
}

// // Get first layer of oncotree (i.e. tissue) node given any node from oncotree
// function getTissueAncestorNode(node) {
//   if (R.propEq('depth', 1, node)) {
//     return node
//   } else {
//     return getTissueAncestorNode(node.parent)
//   }
// }

function useOncotreeSunburstReducer() {
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

export default function OncotreeSunburst ({

}) {
  const {tissues, state, dispatch, sunburstData} = useOncotreeSunburstReducer()
  const {filterTissues, hoveredNode, clickedNode} = state

  if (R.any(R.isNil, [sunburstData])) {
    return null
  }

  return (
    <Segment textAlign='center'>
      <Segment>
      <Form>
        <Form.Group>
          <Form.Field width={12}>
            <Dropdown
              selection
              multiple
              search
              placeholder='Select tissue type to filter Oncotree'
              options={
                R.compose(
                  R.map(
                    ({code, name}) => ({
                      key: code,
                      value: code,
                      text: name
                    })
                  ),
                  R.sortBy(R.prop('code')),
                  R.values      
                )(tissues)
              }
              value={filterTissues}
              onChange={(e, {value}) => dispatch({type: 'setFilterTissues', payload: {value}})}
            />
          </Form.Field>
          <Form.Field width={4}>
            <Button fluid
              onClick={() => dispatch({type: 'resetFilterTissues'})}
              content='Show all tissues'
            />
          </Form.Field>
        </Form.Group>

        {/* {
          RA.isNotNil(clickedNode) &&
          <Form.Group>
          <Form.Field width={16}>
            <Button fluid
              onClick={() => dispatch({type: 'resetClickedNode'})}
            >
              Reset clicked
            </Button>
          </Form.Field>
          </Form.Group>
        } */}
      </Form>
      </Segment>

      <Breadcrumb
        size='big'
        sections={
          R.ifElse(
            R.isNil,
            R.always([{key: 'unhovered', content: 'Hover over to inspect cancer subtypes'}]),
            R.compose(
              R.map(name => ({key: name, content: name})),
              R.tail,
              R.reverse,
              getKeyPath
            )
          )(hoveredNode)
        }
      />

      <Sunburst
        animation
        hideRootNode
        colorType="literal"
        data={sunburstData}
        style={{
          stroke: '#000',
          strokeOpacity: 0.5,
          strokeWidth: 1
        }}
        height={800}
        width={800}
        onValueMouseOver={node => dispatch({type: 'setHoveredNode', payload: {node}})}
        onValueMouseOut={() => dispatch({type: 'resetHoveredNode'})}
        // onValueClick={node => dispatch({type: 'setClickedNode', payload: {node}})}
      >
        <LabelSeries
          data={[
            {
              label: `Oncotree`,
              x: 0, y: 0,
              style: {
                fontSize:'20px',
                textAnchor:'middle'
              }
            },
          ]}
        />
      </Sunburst>
    </Segment>
  )
}
