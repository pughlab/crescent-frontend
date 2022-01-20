import React from 'react'
import { useActor } from '@xstate/react'
import { Header, List, Segment } from 'semantic-ui-react'
import * as R from 'ramda'
import { useAnnotations } from '../../../../redux/hooks'

const SecondaryRunInputChecklist = () => {
  const { annotationsService: service } = useAnnotations()
  
  const [{ context: { inputChecklistLabels, inputsReady, submittable }, matches }, ] = useActor(service)
  const isSubmitting = R.any(matches, ['submitProcessing', 'submitValidating'])
  const isSubmitted = R.any(matches, ['secondaryRunSubmitted', 'cancelProcessing', 'cancelFailed'])
  const isCanceled = matches('secondaryRunCanceled')

  if (!submittable || R.not(R.length(inputsReady))) return null
  
  return (
    <Segment attached>
      <Header
        content="Required Inputs"
        size="small"
        subheader={`${R.length(R.filter(R.equals('success'), inputsReady))}/${R.length(inputsReady)} Uploaded`}
      />
      <List relaxed>
        { R.addIndex(R.map)(
          (inputStatus, index) => {
            const status = isCanceled ? 'canceled' :
                           isSubmitting ? 'submitting' :
                           isSubmitted ? 'submitted' :
                           inputStatus

            return (
              <List.Item key={`${inputChecklistLabels[index]}-${status}`}>
                <List.Icon
                  color={R.prop(status, {
                    pending: 'purple', // Input is awaiting upload
                    loading: 'purple', // Input upload is in progress
                    success: 'green', // Input upload was successful
                    failed: 'red', // Input upload failed
                    submitting: 'purple', // Secondary run is being submitted
                    submitted: 'grey', // Secondary run has been submitted
                    canceled: 'red' // Secondary run has been canceled
                  })}
                  loading={R.any(R.equals(status))(['pending', 'submitting', 'submitted'])}
                  name={R.prop(status, {
                    pending: 'circle notch', // Input is awaiting upload
                    loading: 'upload', // Input upload is in progress
                    success: 'check circle', // Input upload was successful
                    failed: 'times circle', // Input upload failed
                    submitting: 'cog', // Secondary run is being submitted
                    submitted: 'sync alternate', // Secondary run has been submitted
                    canceled: 'dont' // Secondary run has been canceled
                  })}
                  size="big"
                  style={{ padding: 0 }}
                  verticalAlign="middle"
                />
                <List.Content>
                  <List.Header as="h4" content={inputChecklistLabels[index]} />
                  <List.Description>
                    <b>Status:</b>
                    {' '}
                    { R.prop(status, {
                      pending: 'Awaiting upload', // Input is awaiting upload
                      loading: 'Uploading', // Input upload is in progress
                      success: 'Uploaded', // Input upload was successful
                      failed: 'Upload failed', // Input upload failed
                      submitting: 'Submitting', // Secondary run is being submitted
                      submitted: 'Submitted', // Secondary run has been submitted
                      canceled: 'Canceled' // Secondary run has been canceled
                    })}
                  </List.Description>
                </List.Content>
              </List.Item>
            )
          },
          inputsReady
        )}
      </List>
    </Segment>
  )
}

export default SecondaryRunInputChecklist