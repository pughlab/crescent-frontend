import React from 'react'
import { Button } from 'semantic-ui-react'
import { useActor } from '@xstate/react'
import * as R from 'ramda'
import { useAnnotations } from '../../../../redux/hooks'

const SubmitSecondaryRunButton = () => {
  const { annotationsService: service } = useAnnotations()

  const [{ context: { annotationType, submittable: submittableAnnotation }, matches }, send] = useActor(service)

  const isSubmittable = matches('inputsReady')
  const isSubmitting = R.any(matches, ['submitProcessing', 'submitValidating'])
  const isSubmitted = matches('secondaryRunSubmitted')
  const isCanceled = R.any(matches, ['cancelProcessing', 'secondaryRunCanceled'])

  return (
    <Button
      key={`${isSubmittable}-${isSubmitted}-${isCanceled}`}
      fluid
      basic={!submittableAnnotation || !(isSubmittable || isSubmitting || isSubmitted || isCanceled)}
      color="blue"
      content={R.toUpper(
        !submittableAnnotation ? 'Nothing to Submit'
        : isCanceled || isSubmitted ? 'Submitted'
        : isSubmitting ? 'Submitting'
        : isSubmittable ? `Submit ${annotationType} run`
        : "Can't submit yet"
      )}
      disabled={!submittableAnnotation || !isSubmittable || isSubmitting || isSubmitted || isCanceled}
      onClick={() => send({ type: 'SUBMIT_SECONDARY_RUN' })}
    />
  )
}

export default SubmitSecondaryRunButton