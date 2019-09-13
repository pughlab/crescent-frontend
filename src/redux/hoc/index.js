import { connect } from 'react-redux'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import Actions from '../actions'

export default connect(
  state => state,
  dispatch => ({
    actions: {
      setProject: project => dispatch(Actions.setProject({project})),
      setUser: user =>  dispatch(Actions.setUser({user})),
      setRun: run => dispatch(Actions.setRun({run})),
    }
  })
)