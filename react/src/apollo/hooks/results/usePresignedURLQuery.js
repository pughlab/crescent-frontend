import {useState} from 'react'
import {useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'

const usePresignedURLQuery = (bucketName, objectName) => {
  const [presignedURL, setPresignedURL] = useState(null)
  
  useQuery(gql`
    query PresignedURLs($bucketName: String!, $objectName: String!) {
      presignedURL(bucketName: $bucketName, objectName: $objectName)
    }
  `, {
    variables: {
      bucketName,
      objectName
    },
    fetchPolicy: 'cache-and-network',
    onCompleted: ({presignedURL: presignedURLFromQuery}) => {
      setPresignedURL(presignedURLFromQuery)
    }
  })

  return presignedURL
}

export default usePresignedURLQuery