import {useState, useEffect} from 'react'

import {useMutation} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'

export default function useMeMutation() {
  const [me, setMe] = useState()
  const [meMutation, {loading, data, error}] = useMutation(gql`
    mutation CheckInKeycloak {
      me {
        keycloakUserID
        name
        email
      }
    }
  `)

  useEffect(() => {if (!!data) {setMe(data.me)}}, [data])
  useEffect(() => {meMutation()}, [])

  
  return {me}
}