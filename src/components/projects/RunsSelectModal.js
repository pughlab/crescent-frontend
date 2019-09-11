import React, {useState, useEffect} from 'react';

import {Menu, Card, Header, Segment, Button, Grid, Modal, Label, Divider, Icon} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const RunsSelectModal = ({
  currentRunId, setCurrentRunId,
  currentProjectID
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [runs, setRuns] = useState([])
  const {loading, data, error, refetch} = useQuery(gql`
    query RunsByProjectID($projectID: ID!) {
      runs(projectID: $projectID) {
        runID
        name
        params
      }
    }
  `, {variables: {projectID: currentProjectID}})
  // console.log(runs)
  useEffect(() => {
    if (openModal) {refetch()}
  }, [openModal])
  useEffect(() => {
    if (
      R.both(
        RA.isNotNilOrEmpty,
        R.propSatisfies(RA.isNotNil, 'runs')
      )(data)
    ) {
      setRuns(R.prop('runs', data))
    }
  }, [data])
  return (
    <Modal size='fullscreen'
      open={openModal}
      trigger={
        <Menu.Item content='Runs' onClick={() => setOpenModal(true)}/>
      }
    > 
      <Modal.Header as={Header} textAlign='center' content="Runs" />
      <Modal.Content scrolling>
        <Card.Group itemsPerRow={3}>
        {
          R.map(
            ({runID, name, params}) => (
              <Card key={runID} link>
                <Card.Content>
                  <Card.Header as={Header}>
                    <Header.Content>
                      {name}
                      <Header.Subheader content={runID} />
                    </Header.Content>
                  </Card.Header>
                </Card.Content>
                <Card.Content>
                  <Card.Description>
                    {
                      R.compose(
                        ({
                          singleCell,
                          numberGenes: {min: minNumberGenes, max: maxNumberGenes},
                          percentMito: {min: minPercentMito, max: maxPercentMito},
                          resolution,
                          principalDimensions,
                        }) => (
                          <Label.Group>
                            <Label content='Single Cell Input Type' detail={singleCell} />
                            <Label content='Number of Genes' detail={`Min = ${minNumberGenes} | Max = ${maxNumberGenes}`} />
                            <Label content='Mitochondrial Fraction' detail={`Min = ${minPercentMito} | Max = ${maxPercentMito}`} />
                            <Label content='Clustering Resolution' detail={resolution} />
                            <Label content='PCA Dimensions' detail={principalDimensions} />

                          </Label.Group>
                        ),
                        JSON.parse
                      )(params)
                    }
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Button.Group fluid widths={2} color='violet' size='large'>
                    <Button icon='download' content='Download' labelPosition='left'
                      as='a'
                      href={`/download/${currentRunId}`}
                      download
                    />
                    <Button.Or />
                    <Button icon='eye' content='View' labelPosition='right'
                      onClick={() => {
                          setCurrentRunId(runID)
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

export default RunsSelectModal