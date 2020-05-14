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
  const {name, description} = newProjectState
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
    </Form>
  )
}

export default DetailsForm