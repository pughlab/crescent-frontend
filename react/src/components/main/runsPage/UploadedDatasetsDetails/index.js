import {useState} from 'react'
import {Button, Divider, Dropdown, Header, Icon, Label, Menu, Modal, Popup, Segment} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {PulseLoader} from 'react-spinners'

import {useOncotreeQuery, useEditDatasetTagsMutation} from '../../../../apollo/hooks/dataset'
import {useCrescentContext} from '../../../../redux/hooks'

import OncotreeDirectory from './OncotreeDirectory'
import AddCustomTagsButton from './AddCustomTagsButton'
import AddDatasetModal from '../AddDatasetModal'

const TagOncotreeModal = ({
  archived,
  datasetID,
  disabledTagging,
}) => {
  const [open, setOpen] = useState(false)
  const oncotree = useOncotreeQuery()
  const {dataset, tagDataset, addCustomTagDataset, removeCustomTagDataset} = useEditDatasetTagsMutation(datasetID)

  if (R.any(R.isNil, [oncotree, dataset])) {
    return (
      <Label>
        <Header icon textAlign="center">
          <PulseLoader size="4" />
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
      size="large"
      trigger={
        <Popup
          flowing
          content={
            <>
              <Label color={R.prop(cancerTag, {
                'cancer': 'pink',
                'non-cancer': 'purple',
                'immune': 'blue',
              })}>
                <Icon name="paperclip" style={{margin: 0}} />
                <Label.Detail content={R.toUpper(cancerTag)} />
                { RA.isNotNil(oncotreeCode) && <Label.Detail content={oncotreeCode} /> }
              </Label>
              { R.map(tag => <Label key={tag} content={<Icon name="paperclip" style={{ margin: 0 }} />} detail={R.toUpper(tag)} />, dataset.customTags) }
            </>
          }
          on="hover"
          trigger={
            <Button as="div" labelPosition="right">
              <Button 
                basic
                // as={Button} 
                color={R.prop(cancerTag, {
                  'cancer': 'pink',
                  'non-cancer': 'purple',
                  'immune': 'blue',
                })}
                disabled={RA.isNotNil(archived)}
                onClick={() => setOpen(true)}
                // size="big"
              >
                {name}
                {/* {<Label.Detail content={R.toUpper(cancerTag)}  />} */}
                {/* {RA.isNotNil(oncotreeCode) && <Label.Detail content={oncotreeCode} /> */}
                {/* <Label.Detail content={hasMetadata ? 'HAS METADATA' : 'NO METADATA'} /> */}
              </Button>
              <Label
                download
                color={R.prop(cancerTag, {
                  'cancer': 'pink',
                  'non-cancer': 'purple',
                  'immune': 'blue',
                })}
                // Should only work with nginx reverse proxy
                // see: https://github.com/suluxan/crescent-frontend/commit/8300e985804518ce31e1de9c3d3b340ee94de3f6
                href={`/express/download/${datasetID}`}
                icon="cloud download"
                pointing="left"
                target="_blank"
              />
            </Button>
          }
        />
      }
    >
      <TagOncotreeModalContent {...{dataset, disabledTagging, tissueTypes, tagDataset, addCustomTagDataset, removeCustomTagDataset}} />
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
      <Header icon textAlign="center">
        <Icon name="folder open" />
        {name}
      </Header>
      <Menu attached="top">
        <Menu.Item
          active={R.equals(activeMenu, 'oncotree')}
          content="Oncotree Tissue Tag"
          onClick={() => setActiveMenu('oncotree')}
        />
        <Menu.Item
          active={R.equals(activeMenu, 'custom')}
          content="Custom Tags"
          onClick={() => setActiveMenu('custom')}
        />
      </Menu>
      <Segment attached="bottom">
      { R.equals(activeMenu, 'oncotree') ? (
        <>
          <Divider horizontal>
            Tag <a href="http://oncotree.mskcc.org/" rel="noopener noreferrer" target="_blank">Oncotree</a> tissue type using menu below
          </Divider>
          <Button.Group fluid widths={3}>
            <Button
              active={R.equals(cancerTag, 'cancer')}
              color={R.equals(cancerTag, 'cancer') ? 'pink' : undefined}
              content="Cancer"
              disabled={disabledTagging}
              onClick={() => tagDataset({variables: {cancerTag: 'cancer', oncotreeCode}})}
            />
            <Button.Or />
            <Button
              active={R.equals(cancerTag, 'immune')}
              color={R.equals(cancerTag, 'immune') ? 'blue' : undefined}
              content="Immune"
              disabled={disabledTagging}
              onClick={() => tagDataset({variables: {cancerTag: 'immune', oncotreeCode: null}})}
            />
            <Button.Or />
            <Button
              active={R.equals(cancerTag, 'non-cancer')}
              color={R.equals(cancerTag, 'non-cancer') ? 'purple' : undefined}
              content="Non-cancer"
              disabled={disabledTagging}
              onClick={() => tagDataset({variables: {cancerTag: 'non-cancer', oncotreeCode: null}})}
            />
          </Button.Group>
          {/* <OncotreeSunburst /> */}
          {/* <OncotreeTree /> */}
          { R.equals(cancerTag, 'cancer') ? (
            <OncotreeDirectory {...{dataset, tagDataset, disabledTagging}} />
          ) : (
            <>
              <Divider horizontal />
              <Dropdown
                fluid
                search
                selection
                disabled={disabledTagging}
                onChange={(e, {value}) => tagDataset({variables: {cancerTag, oncotreeCode: value}})}
                options={
                  R.compose(
                    R.map(({code, name}) => ({key: code, value: code, text: name})),
                    R.sortBy(R.prop('name'))
                  )(tissueTypes)
                }
                placeholder="Select tissue type"
                value={oncotreeCode}
              />
            </>
          )}
        </>
      ) : R.equals(activeMenu, 'custom') ? (
        <>
          <Divider horizontal>
            Add custom tags/labels to your datasets below
          </Divider>
          { disabledTagging ? (
            <Segment placeholder>
              <Header
                content="You do not have permissions to upload metadata for this dataset"
                textAlign="center"
              />
            </Segment>
          ) : (
            <AddCustomTagsButton {...{dataset, addCustomTagDataset, removeCustomTagDataset}} />
          )}
        </>
      ) : null }
      </Segment>
    </Modal.Content>
  )
}

export default function UploadedDatasetsDetails({ project, refetchProjectDetails }) {
  const {userID: currentUserID} = useCrescentContext()

  if (R.isNil(project)) return null

  const {archived, createdBy: {userID: creatorUserID}, uploadedDatasets} = project
  // Check current user is project creator to allow editing dataset tags
  const disabledTagging = R.not(R.equals(currentUserID, creatorUserID))

  return (
    <Segment attached>
      <Divider horizontal>
        <Header content="Upload Additional Datasets" />
      </Divider>
      <AddDatasetModal {...{archived, refetchProjectDetails}} />
      { RA.isNonEmptyArray(uploadedDatasets) && (
        <>
          <Divider horizontal>
            <Header content="Dataset Tags" />
          </Divider>
          <Label.Group size="large" style={{ lineHeight: '40px' }}>
            {
              R.map(
                ({datasetID}) => (
                  <TagOncotreeModal key={datasetID} {...{archived, datasetID, disabledTagging}} />
                ),
                uploadedDatasets
              )
            }
          </Label.Group>
        </>
      )}
    </Segment>
  )
}