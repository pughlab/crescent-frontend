import React, {useState, useEffect} from 'react';

import {Menu, Card, Popup, Segment, Button, Grid, Modal, Label, Divider, Icon} from 'semantic-ui-react'

import * as R from 'ramda'

const CrescentIcon = () => (
  <Icon.Group style={{marginTop: -3}} >
    <Icon name='cloud' size='big'  />
    <Icon name='moon' size='small' inverted style={{marginTop: 2, marginLeft: -2}} />
  </Icon.Group>
)

const RunsModal = ({
  session,
  currentRunId, setCurrentRunId
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [runs, setRuns] = useState([])
  useEffect(() => {
    fetch(`/runs`)
      .then(response => response.json())
      .then(res => !console.log(res) && setRuns(res))
    // session
    //   .call('crescent.runs', [], {})
    //   .then(res => setRuns(res))
  }, [])
  return (
    <Modal size='fullscreen'
      open={openModal}
      trigger={
        <Menu.Item content='Runs' onClick={() => setOpenModal(true)}/>
      }
    > 
      <Modal.Header content="Runs" />
      <Modal.Content scrolling>
        <Card.Group itemsPerRow={3}>
        {
          R.map(
            ({runId, params}) => (
              <Card key={runId} link>
                <Card.Content>
                  <Card.Header content={runId} />
                  <Card.Description>
                    {
                      R.compose(
                        ({
                          singleCell,
                          resolution,
                          genes,
                          opacity,
                          principalDimensions,
                          returnThreshold
                        }) => (
                          <Label.Group>
                            <Label content='Single Cell Input Type' detail={singleCell} />
                            <Label content='TSNE Resolution' detail={resolution} />
                            <Label content='Opacity' detail={opacity} />
                            <Label content='PCA Dimensions' detail={principalDimensions} />
                            <Label content='Return Threshold' detail={returnThreshold} />
                          </Label.Group>
                        ),
                        JSON.parse
                      )(params)
                    }
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Label.Group>
                  {
                    R.compose(
                      R.map(
                        gene => <Label key={gene} content={gene} />
                      ),
                      R.prop('genes'),
                      JSON.parse
                    )(params)
                  }
                  </Label.Group>
                </Card.Content>
                <Card.Content extra>
                  <Button.Group fluid widths={2} color='violet' size='large'>
                    <Button icon='download' content='Download' labelPosition='left'
                      as='a'
                      href={`/download?runId=${runId}`}
                      download
                    />
                    <Button.Or />
                    <Button icon='eye' content='View' labelPosition='right'
                      onClick={() => {
                          setCurrentRunId(runId)
                          setOpenModal(false)
                        }
                      }
                    />
                  </Button.Group>
                </Card.Content>
              </Card>
            ),
            runs
          )
        }
        </Card.Group>
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={() => setOpenModal(false)} />
      </Modal.Actions>
    </Modal>
  )
}

const MenuComponent = ({
  session,
  currentRunId, setCurrentRunId
}) => {
  return (
    <Segment attached='bottom' style={{height: '10%'}} as={Menu} size='huge'>
      <Menu.Item header>
        <CrescentIcon />
        {`CReSCENT`}
      </Menu.Item>

      <Menu.Menu position='right'>
        <RunsModal
          session={session}
          currentRunId={currentRunId} setCurrentRunId={setCurrentRunId}
        />
      </Menu.Menu>
    </Segment>
  )
}

export default MenuComponent