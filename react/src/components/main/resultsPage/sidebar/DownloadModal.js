import React, {useState} from 'react'
import {Accordion, Button, Header, Icon, Label, List, Modal, Segment} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useBucketObjectsQuery, usePresignedURLQuery} from '../../../../apollo/hooks/results'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'
import {useCrescentContext} from '../../../../redux/hooks'

const FileDownloadButton = ({ file: { filename, objectName }, runID }) => {
  const presignedURL = usePresignedURLQuery(`run-${runID}`, objectName)

  return (
    <List.Item>
      <Button
        as="div"
        labelPosition="right"
        size="small"
      >
        <Button
          basic
          download
          as="a"
          color="violet"
          content={filename}
          href={presignedURL}
          icon={
            <Icon
              name="file"
              style={{marginRight: 8}}
            />
          }
          size="small"
          style={{wordBreak: 'break-all'}}
          target="_blank"
        />
        <Label
          download
          color="violet"
          href={presignedURL}
          icon={
            <Icon fitted name="cloud download" />
          }
          pointing="left"
          style={{marginRight: 0}}
          target="_blank"
        />
      </Button>
    </List.Item>
  )
}

const DownloadAccordion = ({ bucketObjects, level = 1, runID }) => {
  const isTopLevel = R.equals(level, 1)
  const AccordionComponent = isTopLevel ? Accordion : Accordion.Accordion
  const subdirectories = R.keys(R.omit(['files'], bucketObjects))
  const files = bucketObjects['files']
  const hasSubdirectories = RA.isNonEmptyArray(subdirectories)
  const hasFiles = RA.isNonEmptyArray(files)

  const accordionPanels = R.addIndex(R.map)(
    (objectName, index) => {
      const numSubdirectories = R.compose(
        R.length,
        R.keys,
        R.omit(['files'])
      )(bucketObjects[objectName])
      const numFiles = R.length(bucketObjects[objectName]['files'])
      
      return ({
        key: `panel-${level}-${index}`,
        title: {
          content: (
            <>
              <Icon
                circular
                inverted
                color="violet"
                name="folder"
                size="small"
                style={{marginRight: 5}}
              />
              { objectName }
              <small style={{marginLeft: 5}}>
                { `(${numSubdirectories} subdirector${R.equals(numSubdirectories, 1) ? 'y' : 'ies'}, ${numFiles} file${R.equals(numFiles, 1) ? '' : 's'})` }
              </small>
            </>
          )
        },
        content: {
          content: (
            <DownloadAccordion {...{bucketObjects: bucketObjects[objectName], level: level + 1, runID}} />
          )
        }
      })
    },
    subdirectories.sort((a, b) => a.localeCompare(b, 'en', {
      ignorePunctuation: true,
      numeric: true,
      sensitivity: 'base'
    }))
  )
  
  return (
    <>
      { hasSubdirectories && (
        <>
          <Header
            content="Subdirectories"
            size="small"
            style={!isTopLevel ? {margin: `0 0 5px 25px`} : {marginBottom: 5}}
          />
          <AccordionComponent
            exclusive={false}
            panels={accordionPanels}
            style={!isTopLevel ? {margin: `0 0 0 25px`} : {}}
          />
        </>
      )}
      { hasFiles && (
        <>
          <Header
            content="Files"
            size="small"
            style={!isTopLevel ? {margin: `${hasSubdirectories ? '10px': '0'} 0 5px 25px`} : {margin: `${hasSubdirectories ? '10px': '0'} 0 5px 0`}}
          />
          <List style={!isTopLevel ? {marginLeft: 25} : {}}>
            {
              R.addIndex(R.map)((file, index) => (
                <FileDownloadButton
                  key={index}
                  {...{file, runID}}
                />
              ), files.sort(({filename: a}, {filename: b}) => a.localeCompare(b, 'en', {
                ignorePunctuation: true,
                numeric: true,
                sensitivity: 'base'
              })))
            }
          </List>
        </>
      )}
    </>
  )
}

const DownloadModal = () => {
  const [open, setOpen] = useState(false)
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const bucketObjects = useBucketObjectsQuery(`run-${runID}`)

  if (R.any(R.isNil, [run])) return null

  const {status: runStatus} = run

  return (
    <Modal
      {...{open}}
      closeIcon
      onClose={() => setOpen(!open)}
      trigger={
        <Button
          fluid
          color='violet'
          content={R.prop(runStatus, {
            pending: 'RESULTS UNAVAILABLE',
            submitted: 'DOWNLOAD AVAILABLE ON COMPLETE',
            completed: 'DOWNLOAD RESULTS AND LOGS',
            failed: 'DOWNLOAD RUN LOGS'
          })}
          disabled={R.either(R.equals('pending'), R.equals('submitted'))(runStatus)}
          onClick={() => setOpen(!open)}
        >
        </Button>
      }
    >
      <Modal.Header>
        <Header
          content="Download Results and Logs"
          icon="cloud download"
          size="tiny"
        />
      </Modal.Header>
      <Modal.Content scrolling>
        <Segment>
          <DownloadAccordion {...{bucketObjects, runID}} />  
        </Segment>
      </Modal.Content>
    </Modal>
  )
}

export default DownloadModal