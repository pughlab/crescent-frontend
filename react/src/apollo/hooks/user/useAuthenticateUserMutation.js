import { AUTHENTICATE_USER } from '../../fragments/user'
import { useMutation } from '@apollo/react-hooks'

export default function useAuthenticateUserMutation ({
    onCompleted
}) {
    const [authenticateUser, {loading, data, error}] = useMutation(AUTHENTICATE_USER, {onCompleted})

    return [authenticateUser, {loading, data, error}]
}