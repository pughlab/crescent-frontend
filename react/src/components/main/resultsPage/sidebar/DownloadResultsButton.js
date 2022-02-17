import {useState} from 'react'

import {Button, Divider, Modal, Segment} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'


const DownloadModal = () => {
  const [open, setOpen] = useState(false)

  const {runID} = useCrescentContext()
  const {runStatus} = useResultsPage()
  const [clicked, setClicked] = useState(false)


  if (R.isNil(runStatus)) {
    return null
  }

  return (
  <Modal
  {...{open}}
  closeIcon
  onClose={() => setOpen(!open)}
  // closeOnDimmerClick={false}
  trigger={
    // <Button color='grey' basic inverted icon size='large'
    //   onClick={() => setOpen(!open)} 
    // >
    //   <Icon color='black' size='big' name='bug' />
    // </Button>
        <Button fluid color='violet'
        content={R.prop(runStatus, {
          pending: 'RESULTS UNAVAILABLE',
          submitted: 'DOWNLOAD AVAILABLE ON COMPLETE',
          completed: 'DOWNLOAD RESULTS AND LOGS',
          failed: 'DOWNLOAD RUN LOGS'
        })}
        onClick={() => setOpen(!open)} 
        disabled={
          // R.or(R.either(R.equals('pending'), R.equals('submitted'))(runStatus)),(RA.isFalse(downloadable))
          // R.either(R.equals('pending'), R.equals('submitted'))(runStatus)
          R.any(RA.isTrue, [
            R.either(R.equals('pending'), R.equals('submitted'))(runStatus),
            clicked,
            // R.not(downloadable)
          ])}
        >
        </Button>

  }
  >
  <Modal.Content>
    <Divider horizontal>
      Downloads
    </Divider>          
    {
      <Segment>
        <Button fluid inverted color='violet' size='massive'
          content='Download Results'
          download
          target='_blank'
          // Should only work with nginx reverse proxy
          // see: https://github.com/suluxan/crescent-frontend/commit/8300e985804518ce31e1de9c3d3b340ee94de3f6
          href={`/express/download/${runID}`}
          onClick={() => {
            setClicked(true)
          }}
          disabled={
              clicked
            }
        >
        </Button> 
        <Divider/>
        <Button fluid inverted color='violet' size='massive'
          content='Download Loom Objects'
          download
          target='_blank'
          // Should only work with nginx reverse proxy
          // see: https://github.com/suluxan/crescent-frontend/commit/8300e985804518ce31e1de9c3d3b340ee94de3f6
          href={`/express/download/${runID}/LOOM_FILES_CWL`}
          onClick={() => {
            setClicked(true)
          }}
          disabled
        >
        </Button> 
        <Divider/>
        <Button fluid inverted color='violet' size='massive'
          content='Download R Objects'
          download
          target='_blank'
          // Should only work with nginx reverse proxy
          // see: https://github.com/suluxan/crescent-frontend/commit/8300e985804518ce31e1de9c3d3b340ee94de3f6
          href={`/express/download/${runID}/R_OBJECTS_CWL`}
          onClick={() => {
            setClicked(true)
          }}
          disabled
        >
        </Button> 
      </Segment>
    }
  </Modal.Content>
  </Modal>
  )
}


const DownloadResultsButton = () => {
  return (
    <Button.Group fluid widths={1}>

      <DownloadModal />

    </Button.Group>
    // <Button fluid color='violet'
    //   content={R.prop(runStatus, {
    //     pending: 'RESULTS UNAVAILABLE',
    //     submitted: 'DOWNLOAD AVAILABLE ON COMPLETE',
    //     completed: 'DOWNLOAD RESULTS AND LOGS',
    //     failed: 'DOWNLOAD RUN LOGS'
    //   })}
    //   disabled={
    //     // R.or(R.either(R.equals('pending'), R.equals('submitted'))(runStatus)),(RA.isFalse(downloadable))
    //     // R.either(R.equals('pending'), R.equals('submitted'))(runStatus)
    //     R.any(RA.isTrue, [
    //       R.either(R.equals('pending'), R.equals('submitted'))(runStatus),
    //       clicked,
    //       // R.not(downloadable)
    //     ])}
    //   download
    //   target='_blank'
    //   // Should only work with nginx reverse proxy
    //   // see: https://github.com/suluxan/crescent-frontend/commit/8300e985804518ce31e1de9c3d3b340ee94de3f6
    //   href={`/express/download/${runID}`}
    //   onClick={() => {
    //     setClicked(true)
    //   }}
    // />

  )
}

export default DownloadResultsButton