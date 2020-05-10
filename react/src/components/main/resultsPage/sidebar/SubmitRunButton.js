import React from 'react'

import {Button} from 'semantic-ui-react'
import {useGraphene} from '../../../../apollo/hooks'


const SubmitRunButton = ({

}) => {
  // TODO: write a useRunSubmitMutation hook
  const test = useGraphene()
  return (
    <Button fluid color='blue'
      content='SUBMIT'
    />
  )
}

export default SubmitRunButton