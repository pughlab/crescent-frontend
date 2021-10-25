import {useState} from 'react'
import {useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const useBucketObjectsQuery = bucketName => {
  const [bucketObjects, setBucketObjects] = useState(null)

  const addPathToObject = (bucketPath, bucketPathComponents, currBucketObject) => {
    const currBucketPathComponent = bucketPathComponents.shift()
    
    if (RA.isNonEmptyArray(bucketPathComponents)) {
      if (R.isNil(currBucketObject[currBucketPathComponent])) {
        currBucketObject[currBucketPathComponent] = { files: [] }
      }

      addPathToObject(bucketPath, bucketPathComponents, currBucketObject[currBucketPathComponent])
    } else {
      currBucketObject['files'].push({
        filename: currBucketPathComponent,
        objectName: bucketPath
      })
    }
    
    return currBucketObject
  }

  const generateBucketHierarchy = bucketObjectPaths => bucketObjectPaths.reduce(
    (currBucketObject, bucketPath) => addPathToObject(bucketPath, bucketPath.split('/'), currBucketObject),
    { files: [] }
  )
  
  useQuery(gql`
    query BucketObjects($bucketName: String!) {
      bucketObjects(bucketName: $bucketName)
    }
  `, {
    variables: {bucketName},
    fetchPolicy: 'cache-and-network',
    onCompleted: ({bucketObjects: bucketObjectsFromQuery}) => {
      setBucketObjects(generateBucketHierarchy(bucketObjectsFromQuery))
    }
  })

  return bucketObjects
}

export default useBucketObjectsQuery