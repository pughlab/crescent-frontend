import React, {useState} from 'react'

import {Modal, Button, Segment, Label, Grid} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const UploadButton = ({
    label,   
    url, // Minio url
    uploadedFile, setUploadedFile
}) => {
  const [loading, setLoading] = useState(false)
  return (
  <>
    <Button icon='upload'
      loading={loading}
      color={R.isNil(uploadedFile) ? undefined : 'blue'}
      active={RA.isNotNil(uploadedFile)}
      content={R.isNil(uploadedFile) ? label : uploadedFile.name}
      as={'label'}
      htmlFor={label}
    />
    <input hidden id={label} type='file'
      onChange={
        (event) => {
          setLoading(true)
          const file = R.head(event.target.files)
          // Send file to minio
          const xhr = new XMLHttpRequest ()
          xhr.open('PUT', url, true)
          // xhr.setRequestHeader('Access-Control-Allow-Origin', '*') 
          xhr.withCredentials = true
          const formData = new FormData()
          formData.append('uploadedFile', file)
          xhr.send(formData)
          // xhr.onprogress = () => {}
          xhr.onload = () => {
            if (xhr.status == 200) {
              setUploadedFile(file)
              setLoading(false)
            }
          }
          console.log(event.target.files)
        }
      }
    />
  </>
  )
}

const UploadModal = ({
  currentProjectID,
  uploadedBarcodesFile, setUploadedBarcodesFile,
  uploadedGenesFile, setUploadedGenesFile,
  uploadedMatrixFile, setUploadedMatrixFile,
}) => {  
  const [openModal, setOpenModal] = useState(false)
  const uploadsIncomplete = R.all(RA.isNotNil, [uploadedBarcodesFile, uploadedGenesFile, uploadedMatrixFile])
  return (
    <Modal
        open={openModal}
        trigger={
            <Button color='blue' content='Upload' icon='upload' labelPosition='left'
                onClick={() => setOpenModal(true)}
            />
        }
    >
      <Modal.Header content='Upload files' />
      <Modal.Content >
        <Button.Group widths={3} size='massive'>
          <UploadButton label='Barcodes'
            // url='/upload/barcodes'
            url={`/projects/${currentProjectID}/upload/barcodes`}
            uploadedFile={uploadedBarcodesFile}
            setUploadedFile={setUploadedBarcodesFile}
          />
          <UploadButton label='Genes/Features'
            // url='/upload/genes' 
            url={`/projects/${currentProjectID}/upload/genes`}
            uploadedFile={uploadedGenesFile}
            setUploadedFile={setUploadedGenesFile}
          />
          <UploadButton label='Matrix'
            // url='/upload/matrix' 
            url={`/projects/${currentProjectID}/upload/matrix`}
            uploadedFile={uploadedMatrixFile}
            setUploadedFile={setUploadedMatrixFile}
          />
        </Button.Group>
      </Modal.Content>
      <Modal.Actions>
        <Button
          color={uploadsIncomplete ? 'blue' : undefined}
          content={uploadsIncomplete ? 'Confirm' : 'Close'} 
          onClick={() => setOpenModal(false)}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default UploadModal