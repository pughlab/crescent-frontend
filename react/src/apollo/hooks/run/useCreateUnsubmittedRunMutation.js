import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'


export default function useCreateUnsubmittedRunMutation ({
    onCompleted, variables
}) {
    const [createUnsubmittedRun, {loading, data, error}] = useMutation(gql`
        mutation CreateUnsubmittedRun(
            $name: String!,
            $description: String!,
            $projectID: ID!,
            $userID: ID!
            $datasetIDs: [ID!]!
        ) {
            createUnsubmittedRun(
                name: $name
                description: $description
                datasetIDs: $datasetIDs
                projectID: $projectID
                userID: $userID
            ) {
                runID
            }
        }`, {
        variables,
        onCompleted
    })

    return [createUnsubmittedRun, {loading, data, error}]
}