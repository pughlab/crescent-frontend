import React from 'react'
import { Button } from 'semantic-ui-react'
import { useActor } from '@xstate/react'
import * as R from 'ramda'
import { useAnnotations } from '../../../../redux/hooks'

const SubmitSecondaryRunButton = () => {
  const { annotationsService: service } = useAnnotations()

  const [{ context: { annotationType, submittable: submittableAnnotation }, matches }, send] = useActor(service)

  const isUnsubmitted = R.any(matches, ['annotationTypePending', 'annotationTypeInit', 'inputsPending', 'inputsValidating'])
  const isSubmittable = matches('inputsReady')
  const isSubmitting = R.any(matches, ['submitProcessing', 'submitValidating'])
  const isSubmitFailed = matches('submitFailed')
  const isSubmitted = matches('secondaryRunSubmitted')
  const isCanceled = R.any(matches, ['cancelProcessing', 'secondaryRunCanceled'])

  return (
    <Button
      fluid
      basic={
        !submittableAnnotation || // The current annotation type is non-submittable; OR
        isUnsubmitted // The secondary run hasn't been submitted yet
      }
      color="blue"
      content={R.toUpper(
        !submittableAnnotation ? 'Nothing to submit'
        : isSubmittable ? `Submit ${annotationType} run`
        : isSubmitting ? 'Submitting'
        : isSubmitFailed ? 'Submission failed, please try again'
        : isCanceled || isSubmitted ? 'Submitted'
        : "Can't submit yet"
      )}
      disabled={
        !submittableAnnotation || // The current annotation type is non-submittable; OR
        !(isSubmittable || isSubmitFailed) // The secondary run isn't ready to be submitted and the submission didn't fail
      }
      onClick={() => send({ type: 'SUBMIT_SECONDARY_RUN' })}
    />
  )
}

export default SubmitSecondaryRunButton