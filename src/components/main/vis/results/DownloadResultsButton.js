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
        download
        target='_blank'
        // Should only work with nginx reverse proxy
        // see: https://github.com/suluxan/crescent-frontend/commit/8300e985804518ce31e1de9c3d3b340ee94de3f6
        href={`/download/${runID}`}
      />
    )
  }
)

export default DownloadResultsButton