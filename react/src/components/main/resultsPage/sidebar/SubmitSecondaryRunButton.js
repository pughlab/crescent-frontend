import React from 'react'
import { Button, Icon } from 'semantic-ui-react'
import { useActor } from '@xstate/react'
import * as R from 'ramda'
import { useAnnotations } from '../../../../redux/hooks'

const SubmitSecondaryRunButton = () => {
  const { annotationsService: service } = useAnnotations()

  const [{ context: { annotationType, submittable: submittableAnnotation }, matches, value }, send] = useActor(service)

  const isUnsubmittable = R.any(matches, ['inputsPending', 'inputsValidating'])
  const isSubmittable = matches('inputsReady')
  const isSubmitting = R.any(matches, ['submitProcessing', 'submitValidating'])
  const isSubmitFailed = matches('submitFailed')
  const isSubmitted = R.any(matches, ['secondaryRunSubmitted', 'cancelFailed'])
  const isCanceled = R.any(matches, ['cancelProcessing', 'secondaryRunCanceled'])

  return (
    <Button
      key={value}
      fluid
      basic={
        !submittableAnnotation || // The current annotation type is non-submittable; OR
        isUnsubmittable // The secondary run isn't ready to be submitted
      }
      color="blue"
      content={R.toUpper(
        !submittableAnnotation ? 'Nothing to submit'
        : isSubmittable ? `Submit ${annotationType} run`
        : isSubmitting ? 'Submitting'
        : isSubmitFailed ? 'Submission failed, please try again'
        : isSubmitted || isCanceled ? 'Submitted'
        : "Can't submit yet"
      )}
      disabled={
        !submittableAnnotation || // The current annotation type is non-submittable; OR
        !(isSubmittable || isSubmitFailed) // The secondary run isn't ready to be submitted and the submission didn't fail
      }
      icon={isSubmitting && (
        <Icon loading name="circle notch" />
      )}
      onClick={() => send({ type: 'SUBMIT_SECONDARY_RUN' })}
    />
  )
}

export default SubmitSecondaryRunButton