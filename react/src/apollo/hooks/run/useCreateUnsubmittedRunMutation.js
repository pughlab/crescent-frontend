import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { CREATE_UNSUBMITTED_RUN } from '../../queries/run'

export default function useCreateUnsubmittedRunMutation ({
    onCompleted, variables
}) {
    const [createUnsubmittedRun, {loading, data, error}] = useMutation(CREATE_UNSUBMITTED_RUN, {
        variables,
        onCompleted
    })

    return [createUnsubmittedRun, {loading, data, error}]
}