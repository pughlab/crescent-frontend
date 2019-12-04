import React from 'react'
import {Button} from 'semantic-ui-react'

import * as R from 'ramda'

import withRedux from '../../../../redux/hoc'

const DownloadResultsButton = withRedux(
  ({
    app: {
      run: {
        runID,
        status: runStatus
      }
    }
  }) => {
    return (
      <Button fluid color='violet'
        content={R.prop(runStatus, {pending: 'RESULTS UNAVAILABLE', submitted: 'COMPUTING RESULTS IN THE CLOUD', completed: 'DOWNLOAD RESULTS'})}
        disabled={R.not(R.equals('completed', runStatus))}
      />
    )
  }
)

export default DownloadResultsButton