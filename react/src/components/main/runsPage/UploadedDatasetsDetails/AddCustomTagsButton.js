import {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, Header, Grid, Divider, Label, Input, Image } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function AddCustomTagsButton({
  dataset, addCustomTagDataset, removeCustomTagDataset
}) {
  const [customTagAdded, setCustomTagAdded] = useState('')
  const [customTagAddedError, setCustomTagAddedError] = useState(false)
  
  const customTags = R.isNil(dataset) ? [] : dataset.customTags

  return (
    <Grid>
    {
      RA.isNotEmpty(customTags) &&
      <Grid.Column width={16}>
        {/* <Divider content='Custom Tags' horizontal /> */}
        <Label.Group size='large'>
        {
          R.addIndex(R.map)(
            (value, index) => (
              <Label key={index}
                basic
                color='grey'
                content={R.toUpper(value)}
                onRemove={
                  () => removeCustomTagDataset({
                    variables: {customTag: value}
                  })
                }
              />
            ),
            customTags
          )
        }
        </Label.Group>
      </Grid.Column>
    }
    <Grid.Column width={12}>
      <Input 
        placeholder='Enter custom tag'
        icon='paperclip'
        fluid
        value={customTagAdded}
        onChange={(e, {value}) => {
          setCustomTagAddedError(false)
          setCustomTagAdded(value)
        }}
        error={customTagAddedError}
      />
    </Grid.Column>
    <Grid.Column width={4}>
      <Button fluid content='Add'
        onClick={() => addCustomTagDataset({variables: {customTag: customTagAdded}}) && setCustomTagAdded('')}
      />
    </Grid.Column>
    </Grid>

  )
}