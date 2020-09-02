import React, {useState, useEffect, useReducer} from 'react';

import {Segment, List, Button, Form, Input, Popup, Icon, Header, Label, Grid} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'

import Fade from 'react-reveal/Fade'

import {useProjectDetailsQuery, useOncotreeQuery, useOncotreeSunburstQuery, useTagDatasetMutation} from '../../../../apollo/hooks'
import {useCrescentContext} from '../../../../redux/hooks'

import Fuse from 'fuse.js'

import {useDebounce} from 'use-debounce'

// Recursive component for rendering tree node
function OncotreeDirectoryNode ({
  node,
  filteredOncotree,
  tagDataset,
  datasetOncotreeCode,
  datasetOncotreeCodePath,
  disabledTagging
}) {
  const {title, name, children, path} = node
  // Check if current node is in path of a filtered node
  const isFilteredNode = R.ifElse(R.isNil, R.F, R.hasPath(path))(filteredOncotree)
  const isTaggedNodePath = R.includes(title, datasetOncotreeCodePath)
  // const isTaggedNode = R.equals(title, datasetOncotreeCode)

  // Local state for expanding children
  const [expanded, setExpanded] = useState(R.or(isFilteredNode, isTaggedNodePath))
  // useEffect(() => setExpanded(isFilteredNode), [filteredOncotree])
  // useEffect(() => setExpanded(isTaggedNodePath), [datasetOncotreeCodePath])
  useEffect(() => setExpanded(R.or(isFilteredNode, isTaggedNodePath)), [filteredOncotree, datasetOncotreeCodePath])

  return (
    <List.Item>
      <List.Icon size='large' name={R.isNil(children) ? 'circle' : expanded ? 'circle minus' : 'circle plus'}
        onClick={() => setExpanded(!expanded)}
      />
      {/* Current node data and mutation to tag dataset */}
      <List.Content verticalAlign='top'>
        <Popup
          flowing
          position='right center'
          hoverable
          on='click'
          disabled={disabledTagging}
          trigger={
            <Button
              compact
              color={isTaggedNodePath ? 'blue' : isFilteredNode ? 'grey' : undefined}
              basic={R.and(R.not(isTaggedNodePath), R.not(isFilteredNode))}
              onClick={() => setExpanded(!expanded)}
              content={name}
            />
          }
          content={
            <Button color='blue' content={`Tag dataset as '${name} (${title})' `}
              onClick={() => tagDataset({variables: {cancerTag: true, oncotreeCode: title}})}
            
            />
          }
        />
        
        {/* Render current node children */}
        {
          RA.isNotNil(children) &&
          expanded &&
            <List.List>
            {
              R.compose(
                R.addIndex(R.map)((node, idx) => <OncotreeDirectoryNode key={`${node.title}_${idx}`} {...{node, filteredOncotree, tagDataset, datasetOncotreeCode, datasetOncotreeCodePath, disabledTagging}} />),
                // Bubble up current oncotree node path
                R.isNil(datasetOncotreeCode) ? R.identity :
                  R.reduce(
                    (sortedChildren, node) => R.call(R.includes(node.title, datasetOncotreeCodePath) ? R.prepend : R.append, node, sortedChildren),
                    []
                  ), 
                // Bubble up if is in filtered results
                R.isNil(filteredOncotree) ? R.identity :
                  R.compose(
                    ({filtered, unfiltered}) => [...filtered, ...unfiltered],
                    R.reduce(
                      (nodes, node) => R.evolve({
                        [R.hasPath(node.path, filteredOncotree) ? 'filtered' : 'unfiltered']: R.append(node)
                      })(nodes),
                      {filtered: [], unfiltered: []}
                    )
                  )
              )(children)
              
            }
            </List.List>
        }
      </List.Content>
    </List.Item>
  )
}

// Recursive function to flatten oncotree into array of nodes
function unnestChildren(node) {
  return R.ifElse(
    R.has('children'),
    R.converge(
      ({title, name, path}, children) => [{title, name, path}, children],
      [R.identity, R.compose(R.map(unnestChildren), R.prop('children'))]
    ),
    ({title, name, path}) => ({title, name, path})
  )(node)
}

export default function OncotreeDirectory ({
  dataset, tagDataset, disabledTagging
}) {
  // State for searching oncotree nodes by name
  const [textSearch, setTextSearch] = useState('')
  const [debouncedTextSearch] = useDebounce(textSearch, 1000);

  const {oncotree, tissues, oncotreeRawJSON} = useOncotreeSunburstQuery()

  if (R.any(R.isNil, [oncotree, dataset])) {
    return null
  }

  const {oncotreeCode} = dataset
  
  // Flatten oncotree to filter with fuse.js
  const oncotreeNodes = R.compose(
    R.flatten,
    R.map(unnestChildren),
  )(oncotree.children)
  // Instantiate fuse search
  const fuse = new Fuse(oncotreeNodes, {
    threshold: 0.3,
    keys: ['name'],
    ignoreLocation: true
  })

  // Create tree where keys are path to deepest filtered nodes from fuse
  // Object of nodes that matched fuse search
  // {[node.title]: node}
  const filteredNodes = R.ifElse(
    R.isEmpty,
    R_.alwaysNull,
    R.compose(
      R.reduce((obj, {title, name, path}) => ({...obj, [title]: {title, name, path}}), {}),
      R.pluck('item'),
      text => fuse.search(text)
    )
  )(debouncedTextSearch)
  // Object of filtered node paths
  // {[node.title]: {[node.title]: {...}}}
  const filteredOncotree = R.ifElse(
    R.isNil,
    R_.alwaysNull,
    R.compose(
      R.reduce((pathTree, {path}) => R.assocPath(path, true, pathTree), {}),
      R.values
    )
  )(filteredNodes)

  const oncotreeCodePath = R.ifElse(
    R.isNil,
    R_.alwaysEmptyArray,
    R.compose(
      R.prop('path'),
      oncotreeCode => R.find(R.propEq('title', oncotreeCode), oncotreeNodes)
    )
  )(oncotreeCode)

  return ( 
    <Segment basic>
      <Input
        fluid
        label={RA.isNotNil(oncotreeCode) && <Label color='blue' content='Currently' detail={oncotreeCode} />}
        placeholder='Search Oncotree'
        value={textSearch}
        onChange={(e, {value}) => setTextSearch(value)}
      />
    <List>
    {/* Render first layer of oncotree (tissues) */}
    {
      R.compose(
        R.addIndex(R.map)((node, idx) => <OncotreeDirectoryNode key={`${node.title}_${idx}`} node={node} filteredOncotree={filteredOncotree} tagDataset={tagDataset} datasetOncotreeCode={oncotreeCode} datasetOncotreeCodePath={oncotreeCodePath} disabledTagging={disabledTagging}/>),
        // If dataset has non null oncotreeCode then bubble that parent tissue to top 
        R.isNil(oncotreeCode) ? R.identity :
          R.reduce(
            (nodes, node) => R.call(R.includes(node.title, oncotreeCodePath) ? R.prepend : R.append, node, nodes),
            []
          ),
          
        // If searching by text (i.e. computing non-null filteredOncotree) then bubble filtered nodes to top
        R.isNil(filteredOncotree) ? R.identity :
          R.compose(
            ({filtered, unfiltered}) => [...filtered, ...unfiltered],
            R.reduce(
              (sortedTissues, node) => R.evolve({
                [R.hasPath(node.path, filteredOncotree) ? 'filtered' : 'unfiltered']: R.append(node)
              })(sortedTissues),
              {filtered: [], unfiltered: []}
            )
          )
      )(oncotree.children)
    } 
    </List>
    </Segment>
  )
}
