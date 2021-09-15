import React, {useEffect, useState} from 'react'
import {Button, Container, Grid, Header, Icon, Label, Message, Modal} from 'semantic-ui-react'
import Shake from 'react-reveal/Shake'
import {useSemverCheck} from '../../utils/hooks'

const CacheReloadModal = () => {
  const {currentVersion, latestVersion, isVersionOutdated, deleteCacheAndReload} = useSemverCheck()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    setModalOpen(isVersionOutdated)
  }, [isVersionOutdated])

  return (
    <Modal
      closeIcon
      closeOnDimmerClick={false}
      closeOnEscape={false}
      onClose={() => setModalOpen(false)}
      open={modalOpen}
      size="tiny"
    >
      <Modal.Header>
        <Header
          content="Outdated Cached Version"
          icon="refresh"
          size="tiny"
        />
      </Modal.Header>
      <Modal.Content>
        <Message negative>
          <b>Please update to see the latest changes.</b>
        </Message>
        <Grid
          columns={3}
          textAlign="center"
          verticalAlign="middle"
        >
          <Grid.Column width={7}>
            <Header content="Current Version" />
            <Label
              content={currentVersion}
              icon="angle down"
            />
          </Grid.Column>
          <Grid.Column width={2}>
            <Shake
              duration={7500}
              forever
            >
              <Icon
                name="arrow right"
                size="big"
              />
            </Shake>
          </Grid.Column>
          <Grid.Column width={7}>
            <Header content="Latest Version" />
            <Label
              icon="angle up"
              color="grey"
              content={latestVersion}
            />
          </Grid.Column>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Container>
          <Button
            color="green"
            content="Update (Recommended)"
            fluid
            onClick={() => deleteCacheAndReload()}
          />
        </Container>
      </Modal.Actions>
    </Modal>
  )
}

export default CacheReloadModal