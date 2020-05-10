import React from 'react'

import {Modal, Segment, Image, Button} from 'semantic-ui-react'


import {useDispatch} from 'react-redux'
import {goHome} from '../../redux/actions/context'

import {useCrescentContext} from '../../redux/hooks'
import Logo from '../login/logo.jpg'


const ErrorComponent = ({

}) => {
  const dispatch = useDispatch()

  return (
    <Modal open basic dimmer='inverted'>
      <Modal.Content>
        <Segment attached='top'>
          <Button fluid size='massive' animated='vertical' color='grey'
            onClick={() => dispatch(goHome())}
          >
            <Button.Content visible content={'An error occurred'} />
            <Button.Content hidden content={'Restart Portal'} />
          </Button>
        </Segment>
        <Segment attached='bottom'>
          <Image src={Logo} size='medium' centered/>
        </Segment>
      </Modal.Content>
    </Modal>
  )
}

export default ErrorComponent