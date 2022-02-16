import React from 'react'
import {Button, Card, Divider, Header, Icon, Label, Message, Popup} from 'semantic-ui-react'
import Marquee from 'react-marquee'
import moment from 'moment'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useDispatch} from 'react-redux'
import {setRunSelected} from '../../../../redux/slices/projectArchive'
import {useProjectArchive} from '../../../../redux/hooks'

const ProjectRunCard = ({ run }) => {
  const dispatch = useDispatch()
  const {selectedRuns} = useProjectArchive()

  const {
    completedOn,
    createdBy: {
      name: creatorName
    },
    datasets,
    description,
    hasResults,
    name,
    parameters: {
      clustering,
      expression,
      normalization,
      reduction
    },
    runID,
    status,
    submittedOn
  } = run

  const isSelected = R.includes(runID, selectedRuns)

  const statusColor = R.prop(status, {
    pending: 'orange',
    submitted: 'yellow',
    completed: 'green',
    failed: 'red'
  })

  const parameterValues = R.compose(
    R.unnest,
    R.values,
    R.map(R.toPairs)
  )([normalization, reduction, clustering, expression])

  return (
    <Card onClick={() => dispatch(setRunSelected({runID}))}>
      <Popup
        size="large"
        trigger={
          <Button
            attached="top"
            color={isSelected ? 'red' : 'grey'}
            icon={
              <Icon
                name="file outline"
                size="large"
              />
            }
          />
        }
        wide="very"
      >
        <>
          { R.both(RA.isNotNil, RA.isNotEmpty)(description) && (
            <Message size="mini">
              <Message.Content>
                <Divider horizontal content="Details" />
                {description}
              </Message.Content>
            </Message>
          )}
          <Message>
            <Message.Content>
              <Divider horizontal content="Datasets" />
              <Label.Group>
                { R.map(
                  ({ datasetID, name, cancerTag }) => (
                    <Label
                      key={datasetID}
                      color={R.prop(cancerTag, {
                        'cancer': 'pink',
                        'non-cancer': 'purple',
                        'immune': 'blue',
                      })}
                      content={name}
                      detail={R.toUpper(cancerTag)}
                    />
                  ),
                  datasets
                )}
              </Label.Group>
              <Divider horizontal content="Parameters" />
              <Label.Group>
                { R.map(
                  ([parameterKey, parameterValue]) => (
                    <Label
                      key={parameterKey}
                      content={parameterKey}
                      detail={parameterValue}
                    />
                  ),
                  parameterValues
                )}
              </Label.Group>
            </Message.Content>
          </Message>
        </>
      </Popup>
      <Card.Content>
        <Header size="small">
          <Marquee text={name} />
        </Header>
        <Label.Group>
          <Label
            detail={creatorName}
            icon={
              <Icon
                name="user"
                style={{ margin: 0 }}
              />
            }
          />
          { RA.isNotNil(submittedOn) && (
            <>
              <Label
                detail={`${moment(submittedOn).format('D MMMM YYYY, h:mm a')}`}
                icon={
                  <Icon
                    name="calendar alternate outline"
                    style={{ margin: 0 }}
                  />
                }
              />
              <Label
                detail={`${moment(RA.isNotNil(completedOn) ? completedOn : new Date()).diff(moment(submittedOn), 'minutes')} minutes`}
                icon={
                  <Icon
                    name="clock"
                    style={{ margin: 0 }}
                  />
                }
              />
            </>
          )}
          <Label
            detail={`${R.length(datasets)} dataset(s)`}
            icon={
              <Icon
                name="upload"
                style={{ margin: 0 }}
              />
            }
          />
          { hasResults &&
            <Label
              content={
                <Icon
                  name="exclamation circle"
                  style={{ margin: 0 }}
                />
              }
              detail="Results available"
            />
          }
        </Label.Group>
      </Card.Content>
      <Card.Content extra>
        <Label
          basic
          color={statusColor}
          content={R.toUpper(status)}
        />
      </Card.Content>
    </Card>
  )
}

export default ProjectRunCard