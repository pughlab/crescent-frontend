import React, {useState, useEffect, useReducer} from 'react';

import {Segment, List, Button, Form, Input, Popup, Icon, Header, Label} from 'semantic-ui-react'
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
  datasetOncotreeCode
}) {
  const {title, name, children, path} = node
  // Check if current node is in path of a filtered node
  const isFilteredNode = R.ifElse(R.isNil, R.F, R.hasPath(path))(filteredOncotree)

  // Local state for expanding children
  const [expanded, setExpanded] = useState(isFilteredNode)
  useEffect(() => setExpanded(isFilteredNode), [filteredOncotree])

  const isDatasetOncotreeNode = R.equals(datasetOncotreeCode, title)
  return (
    <List.Item>
      <List.Icon size='large' name={R.isNil(children) ? 'circle' : expanded ? 'circle minus' : 'circle plus'}
        onClick={() => setExpanded(!expanded)}
      />
      {/* Current node data and mutation to tag dataset */}
      <List.Content verticalAlign='top'>
        <Popup
          flowing
          position='top left'
          hoverable
          on='click'
          trigger={
            <Button
              color={isDatasetOncotreeNode ? 'blue' : isFilteredNode ? 'grey' : undefined}
              basic={R.and(R.not(isDatasetOncotreeNode), R.not(isFilteredNode))}
              onClick={() => setExpanded(!expanded)}
              content={name}
            />
          }
          content={
            <Button color='blue' content={`Set dataset as '${name} (${title})' `}
              onClick={() => tagDataset({variables: {cancerTag: true, oncotreeCode: title}})}
            
            />
          }
        />
        
        {/* Render current node children */}
        {
          RA.isNotNil(children) &&
          expanded &&
            <List.List>
            {R.map(node => <OncotreeDirectoryNode key={node.title} {...{node, filteredOncotree, tagDataset, datasetOncotreeCode}} />, children) }
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
  dataset, tagDataset
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
        R.map(node => <OncotreeDirectoryNode key={node.title} node={node} filteredOncotree={filteredOncotree} tagDataset={tagDataset} datasetOncotreeCode={oncotreeCode} />),
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
