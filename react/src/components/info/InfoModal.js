import React, {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import UHN from './UHN.png'
import SK from './SK.png'
import GC from './GC.jpeg'
import MBD from './MBD.jpg'

const InfoModal = ({
}) => {
  const [open, setOpen] = useState(false)
  return (
    <>
    <Popup inverted size='large'
      trigger={
        <Button color='grey' inverted basic icon size='large'
          onClick={() => setOpen(!open)}
        >
          <Icon color='black' size='big' name='info circle' />
        </Button>
      }
      content={
        'Info/Help'
      }
    />
    <Modal
      {...{open}}
      closeIcon
      onClose={() => setOpen(!open)}
      closeOnDimmerClick={false}

    >
      <Modal.Content>
          <Segment>
            <Header content='Help'/>
            A quick walkthrough of accessing and exploring public datasets can be found on <a href='https://youtu.be/KK4Xc6SBSSY' target='_blank' rel="noopener noreferrer">Youtube.</a> 
            <Embed
              id='7a23FASMn6I'
              source='youtube'
            />
          </Segment>

          <Segment>
            <Header content='Contact Us'/>
            To reach the crescent.cloud portal-dev team and to report bugs or request features, please use the template forms found on our <a href='https://github.com/pughlab/crescent/issues' target='_blank'>Github</a> or email us at <a href='mailto:crescent@uhnresearch.ca'>crescent@uhnresearch.ca</a>.
          </Segment>

          <Segment>
            <Header content='About Us'/>
            CanceR Single Cell ExpressioN Toolkit (CReSCENT) is a scalable and standardized set of novel algorithmic methods, tools, and a data portal deployed on cloud computing infrastructure. To allow comparison of cells in cancerous and healthy tissues, the system will aggregate single-cell genomic data generated by cancer researchers and connect them to international reference data generated by experts from around the world. This data sharing and aggregation system is a key differentiating factor in CReSCENT that will increase researcher productivity by accelerating execution and comparison of computational methods, as well as providing contextual data for understanding how cells behave within tumour tissues. CReSCENT is available under an open source license via <a href='https://github.com/pughlab/crescent/blob/master/LICENSE' target='_blank' rel="noopener noreferrer">Github.</a>
          </Segment>

          <Segment>
            <Header content='Supported By'/>
            <Grid>
              <Grid.Row columns={4}>
                <Grid.Column>
                  <Image src={UHN}/>
                </Grid.Column>
                <Grid.Column>
                  <Image src={SK}/>
                </Grid.Column>
                <Grid.Column>
                  <Image src={GC}/> 
                </Grid.Column>
                <Grid.Column>
                  <Image src={MBD}/>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
      </Modal.Content>
    </Modal>
    </>
  )
}

export default InfoModal