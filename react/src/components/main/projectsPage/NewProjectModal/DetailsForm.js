import React, {useState, useCallback, useEffect, useReducer} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../../utils'

import {Form, Dropdown, Header, Menu, Button, Segment, Modal, Label, Divider, Icon, Image, Popup, Grid, Step} from 'semantic-ui-react'


const DetailsForm = ({
  newProjectState,
  newProjectDispatch
}) => {
  const {name, description, oncotreeReference, cancerTag} = newProjectState
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
  `)

  const tissueTypes = R.ifElse(
    queryIsNotNil('oncotree'),
    R.path(['oncotree', 'tissue']),
    R.always([])
  )(data)
  return (
    <Form>
      <Form.Input fluid
        placeholder='Enter a project name'
        value={name}
        onChange={(e, {value}) => newProjectDispatch({type: 'CHANGE_NAME', name: value})}
      />
      <Form.TextArea
        placeholder='Enter a short project description'
        value={description}
        onChange={(e, {value}) => newProjectDispatch({type: 'CHANGE_DESCRIPTION', description: value})}
      />
      <Divider horizontal />
      <Modal
        size='small'
        trigger={
          <Button fluid>
          {
            R.isNil(oncotreeReference) ?
              'Click to tag project to Oncotree'
            :
              R.compose(
                R.prop('name'),
                R.find(R.propEq('code', oncotreeReference))
              )(tissueTypes)
          }
          </Button>
        }
      >
        <Modal.Header as={Header} textAlign='center' content='Oncotree Reference' />
        <Modal.Content>
          
          <Button.Group fluid widths={2}>
            <Button content='Cancer'
              active={cancerTag}
              color={cancerTag ? 'blue' : undefined}
              onClick={() => R.not(cancerTag) && newProjectDispatch({type: 'TOGGLE_CANCER_TAG'})}
            />
            <Button.Or />
            <Button content='Non-cancer'
              active={R.not(cancerTag)}
              color={R.not(cancerTag) ? 'blue' : undefined}
              onClick={() => cancerTag && newProjectDispatch({type: 'TOGGLE_CANCER_TAG'})}
            />
          </Button.Group>
          <Divider horizontal />
          <Dropdown fluid
            selection
            search
            placeholder='Select tissue type'
            options={
              R.map(
                ({code, name}) => ({
                  key: code,
                  value: code,
                  text: name
                }),
                tissueTypes
              )
            }
            value={oncotreeReference}
            onChange={(e, {value}) => newProjectDispatch({type: 'CHANGE_ONCOTREE_REFERENCE', oncotreeReference: value})}
          />
        </Modal.Content>
      </Modal>
    </Form>
  )
}

export default DetailsForm