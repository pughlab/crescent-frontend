import React, { useEffect } from 'react'
import { Divider, Header, Icon, Message, Popup, Segment } from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { useCrescentContext } from '../../../../redux/hooks'
import { useFailedRunLogsQuery } from '../../../../apollo/hooks/run'

const FailedRunLogs = () => {
  const { runID } = useCrescentContext()
  const { failedRunLogs, stopFailedRunLogsPolling } = useFailedRunLogsQuery(runID)

  useEffect(() => {
    if (RA.isNotNil(failedRunLogs)) stopFailedRunLogsPolling()
  }, [failedRunLogs, stopFailedRunLogsPolling])

  if (R.isNil(failedRunLogs)) {
    return (
      <Segment
        color="purple"
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Divider horizontal>
          <Header content="Failed Run Logs" />
        </Divider>
        <Message negative style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1
        }}>
          <Header icon textAlign="center">
            <Header.Content>
              <Icon name="exclamation circle" />
              No failed run logs available
              {/* {' '}
              <Popup
                trigger={
                  <Icon
                    name="question circle"
                    style={{
                      display: 'inline-block',
                      fontSize: 16,
                      verticalAlign: 'super'
                    }}  
                  />
                }
                wide="very"
              >
                Failed run logs (if available) may take a brief moment to load
              </Popup> */}
            </Header.Content>
          </Header>
        </Message>
      </Segment>
    )
  }

  const splitByNewLine = R.compose(R.map(R.trim), R.split('\n'))
  const mapToParagraph = R.addIndex(R.map)((failedRunLogsLine, index) => <p key={index}>{ failedRunLogsLine }</p>)

  return (
    <Segment
      color="purple"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        maxHeight: '80vh',
        overflow: 'hidden'
      }}
    >
      <Divider horizontal>
        <Header content="Failed Run Logs" />
      </Divider>
      <Message negative style={{
        display: 'block',
        flexGrow: 1,
        overflow: 'auto'
      }}>
        {
          R.compose(
            mapToParagraph,
            splitByNewLine
          )(failedRunLogs)
        }
      </Message>
    </Segment>
  )
}

export default FailedRunLogs