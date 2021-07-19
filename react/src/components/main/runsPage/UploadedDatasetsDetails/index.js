import React, {useState, useEffect, useReducer} from 'react';

import {Container, Breadcrumb, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Input, Menu, Form, Popup} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {PulseLoader} from 'react-spinners'

import {useProjectDetailsQuery} from '../../../../apollo/hooks/project'
import {useOncotreeQuery, useEditDatasetTagsMutation} from '../../../../apollo/hooks/dataset'
import {useCrescentContext} from '../../../../redux/hooks'

import OncotreeSunburst from './OncotreeSunburst'
import OncotreeTree from './OncotreeTree'
import OncotreeDirectory from './OncotreeDirectory'

import UploadMetadataButton from './UploadMetadataButton'
import AddCustomTagsButton from './AddCustomTagsButton';

const TagOncotreeModal = ({
  datasetID,
  disabledTagging,
}) => {
  const [open, setOpen] = useState(false)
  const oncotree = useOncotreeQuery()
  const { dataset, tagDataset, addCustomTagDataset, removeCustomTagDataset } = useEditDatasetTagsMutation(datasetID)

  if (R.any(R.isNil, [oncotree, dataset])) {

    // return null
    return (
      <Label>
         <Header textAlign='center' icon>
          <PulseLoader size='4'/>
         </Header>
      </Label>
      )
  }

  const {tissue: tissueTypes} = oncotree
  const {name, cancerTag, oncotreeCode} = dataset
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
            <Button as='div' labelPosition='right'>
            <Button 
            // as={Button} 
            // size='big'
            basic
            color={R.prop(cancerTag, {
              true: 'pink',
              false: 'purple',
              null: 'blue',
            })}
            onClick={() => setOpen(true)}>
              {name}
              {/* {<Label.Detail content={cancerTag ? 'CANCER' : R.equals(cancerTag, null) ? 'IMMUNE' : 'NON-CANCER'}  />} */}
              {/* {RA.isNotNil(oncotreeCode) && <Label.Detail content={oncotreeCode} />}
              <Label.Detail content={hasMetadata ? 'HAS METADATA' : 'NO METADATA'} /> */}
            </Button>
            <Label
            icon='cloud download'
            download
            target='_blank'
            // Should only work with nginx reverse proxy
            // see: https://github.com/suluxan/crescent-frontend/commit/8300e985804518ce31e1de9c3d3b340ee94de3f6
            href={`/express/download/${datasetID}`}
            color={R.prop(cancerTag, {
              true: 'pink',
              false: 'purple',
              null: 'blue',
            })}            
            pointing='left'
            />
            </Button>
            
          }
          content={
            <>
              <Label
              color={R.prop(cancerTag, {
                true: 'pink',
                false: 'purple',
                null: 'blue',
              })}
              >
                {<Icon style={{margin: 0}} name='paperclip' /> }      
                {<Label.Detail content={cancerTag ? 'CANCER' : R.equals(cancerTag, null) ? 'IMMUNE' : 'NON-CANCER'}  />}
                {RA.isNotNil(oncotreeCode) && <Label.Detail content={oncotreeCode} />}
              </Label>
              {R.map(tag => <Label key={tag} content={<Icon style={{ margin: 0 }} name='paperclip'/>} detail={R.toUpper(tag)} />, dataset.customTags)}
            </>
          }
        />
      }
    >
      <TagOncotreeModalContent {...{dataset, disabledTagging, tissueTypes, tagDataset, addCustomTagDataset, removeCustomTagDataset}}/>
    </Modal>
  )
}

export function TagOncotreeModalContent({
  dataset,
  disabledTagging,
  tissueTypes,
  tagDataset,
  addCustomTagDataset, 
  removeCustomTagDataset
}) {
  const [activeMenu, setActiveMenu] = useState('oncotree')
  const {name, cancerTag, oncotreeCode} = dataset

  return (
    <Modal.Content>
      <Header icon textAlign='center'>
        <Icon name='folder open' />
        {name}
      </Header>
      <Menu attached='top'>
        <Menu.Item content='Oncotree Tissue Tag'
          active={R.equals(activeMenu, 'oncotree')} onClick={() => setActiveMenu('oncotree')}
        />
        <Menu.Item content='Custom Tags'
          active={R.equals(activeMenu, 'custom')} onClick={() => setActiveMenu('custom')}
        />
      </Menu>
      <Segment attached='bottom'>
      {
        R.equals(activeMenu, 'oncotree') ?
          <>
            <Divider horizontal>
              Tag <a target="_blank" href='http://oncotree.mskcc.org/' >Oncotree</a> tissue type using menu below
            </Divider>
            <Button.Group fluid widths={3}>
              <Button content='Cancer'
                disabled={disabledTagging}
                active={cancerTag}
                color={cancerTag ? 'pink' : undefined}
                onClick={() => tagDataset({variables: {cancerTag: true, oncotreeCode}})}
              />
              <Button.Or />
              <Button content='Immune'
                disabled={disabledTagging}
                active={R.equals(cancerTag, null)}
                color={R.equals(cancerTag, null) ? 'blue' : undefined}
                onClick={() => tagDataset({variables: {cancerTag: null, oncotreeCode: null}})}
              />
              <Button.Or />
              <Button content='Non-cancer'
                disabled={disabledTagging}
                active={R.equals(cancerTag, false)}
                color={R.equals(cancerTag, false) ? 'purple' : undefined}
                onClick={() => tagDataset({variables: {cancerTag: false, oncotreeCode: null}})}
              />
            </Button.Group>

            {/* <OncotreeSunburst /> */}
            {/* <OncotreeTree /> */}
            {
              cancerTag ?
                <OncotreeDirectory {...{dataset, tagDataset, disabledTagging}} />
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
          </>
          : R.equals(activeMenu, 'custom') ?
            <>
              <Divider horizontal>
                Add custom tags/labels to your datasets below
              </Divider>
              {
              disabledTagging ? 
                <Segment placeholder>
                  <Header textAlign='center'
                    content={'You do not have permissions to upload metadata for this dataset'}
                  />
                </Segment>
              :
              <AddCustomTagsButton {...{dataset, addCustomTagDataset, removeCustomTagDataset}} />
              }
          </>
        : null
      }
      </Segment>
    </Modal.Content>
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
        <Header content={'Dataset Tags'} />
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