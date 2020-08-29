import React, {useState, useEffect, useReducer} from 'react';

import {Container, Breadcrumb, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Step, Transition, Form, Popup} from 'semantic-ui-react'

import {Sunburst} from 'react-vis'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useProjectDetailsQuery, useOncotreeQuery, useOncotreeSunburstQuery, useTagDatasetMutation} from '../../../../apollo/hooks'
import {useCrescentContext} from '../../../../redux/hooks'

import OncotreeSunburst from './OncotreeSunburst'
import OncotreeTree from './OncotreeTree'
import OncotreeDirectory from './OncotreeDirectory'

const TagOncotreeModal = ({
  datasetID,
  disabledTagging
}) => {
  const [open, setOpen] = useState(false)
  const oncotree = useOncotreeQuery()
  const {dataset, tagDataset} = useTagDatasetMutation(datasetID)
  if (R.any(R.isNil, [oncotree, dataset])) {
    return null
  }

  const {tissue: tissueTypes} = oncotree
  const {name, cancerTag, oncotreeCode, hasMetadata} = dataset
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      size='large'
      trigger={
        <Popup
          flowing
          on='hover'
          trigger={
            <Label as={Button} onClick={() => setOpen(true)}>
              {name}
              {/* {RA.isNotNil(cancerTag) && <Label.Detail content={cancerTag ? 'CANCER' : 'NON-CANCER'} />}
              {RA.isNotNil(oncotreeCode) && <Label.Detail content={oncotreeCode} />}
              <Label.Detail content={hasMetadata ? 'HAS METADATA' : 'NO METADATA'} /> */}
            </Label>
          }
          content={
            <Label>
              {RA.isNotNil(cancerTag) && <Label.Detail content={cancerTag ? 'CANCER' : 'NON-CANCER'} />}
              {RA.isNotNil(oncotreeCode) && <Label.Detail content={oncotreeCode} />}
              <Label.Detail content={hasMetadata ? 'HAS METADATA' : 'NO METADATA'} />
            </Label>
          }
        />
      }
    >
      <Modal.Content>
        <Header icon textAlign='center'>
          <Icon name='folder open' />
          {name}
          <Header.Subheader>
          Tag <a target="_blank" href='http://oncotree.mskcc.org/' >Oncotree</a> tissue type using menu below
          </Header.Subheader>
        </Header>
        <Button.Group fluid widths={2}>
          <Button content='Cancer'
            disabled={disabledTagging}
            active={cancerTag}
            color={cancerTag ? 'blue' : undefined}
            onClick={() => tagDataset({variables: {cancerTag: true, oncotreeCode}})}
          />
          <Button.Or />
          <Button content='Non-cancer'
            disabled={disabledTagging}
            active={R.not(cancerTag)}
            color={R.not(cancerTag) ? 'blue' : undefined}
            onClick={() => tagDataset({variables: {cancerTag: false, oncotreeCode: null}})}
          />
        </Button.Group>

        {/* <OncotreeSunburst /> */}
        {/* <OncotreeTree /> */}
        {
          cancerTag ?
            <OncotreeDirectory {...{dataset, tagDataset}} />
          :
            <>
            <Divider horizontal />
            <Dropdown fluid
              disabled={disabledTagging}
              selection
              search
              placeholder='Select tissue type'
              options={
                R.compose(
                  R.map(({code, name}) => ({key: code, value: code, text: name})),
                  R.sortBy(R.prop('name'))
                )(tissueTypes)
              }
              value={oncotreeCode}
              onChange={(e, {value}) => tagDataset({variables: {cancerTag, oncotreeCode: value}})}
            /> 
            </>
        }
      </Modal.Content>
    </Modal>
  )
}

export default function UploadedDatasetsDetails ({
}) {
  const {userID: currentUserID, projectID} = useCrescentContext()
  const project = useProjectDetailsQuery(projectID)
  if (R.isNil(project)) {
    return null
  }
  const {uploadedDatasets, createdBy: {userID: creatorUserID}} = project
  // Check current user is project creator to allow editing dataset tags
  const disabledTagging = R.not(R.equals(currentUserID, creatorUserID))
  return (
    <Segment attached>
      <Divider horizontal>
        <Header content={'Uploaded Datasets'} />
      </Divider>
      <Label.Group size='large'>
      {
        R.map(
          ({name, datasetID}) => (
            <TagOncotreeModal key={datasetID} {...{datasetID, disabledTagging}} />
          ),
          uploadedDatasets
        )
      }
      </Label.Group>
    </Segment>
  )
}