import React, {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const ReportBugModal = ({
}) => {
  return (
    <Popup inverted size='large'
      trigger={
        <Button color='grey' basic inverted icon size='large' 
        target='_blank'
        href={'https://github.com/pughlab/crescent-frontend/issues/new/choose'}
        >
          <Icon color='black' size='big' name='bug' />
        </Button>
      }
      content={
        'Report Bug'
      }
    />
  )
}

export default ReportBugModal