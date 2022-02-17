import * as R from 'ramda'
import {Divider, Image, Segment} from 'semantic-ui-react'
import {useResultsPage} from '../../../../redux/hooks'
import Logs from './Logs'
import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'

const LogsComponent = () => {
  const {runStatus} = useResultsPage()

  if (R.isNil(runStatus)) return null

  return (
    <Segment
      color="red"
      style={{height: '100%'}}
    >
      <Segment basic placeholder>
        <Tada forever duration={1000}>
          <Image
            centered
            src={Logo}
            size="medium"
          />
        </Tada>
        <Divider hidden horizontal />
        <Logs />
      </Segment>
    </Segment> 
  )
}

export default LogsComponent