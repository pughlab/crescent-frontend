import React, {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import UHN from './UHN.png'
import SK from './SK.png'
import GC from './GC.png'
import OG from './OG.png'
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
      // closeOnDimmerClick={false}

    >
      <Modal.Content>
          <Segment>
            <Header content='Help'/>
            <a href='https://pughlab.github.io/crescent-frontend/' target='_blank' rel="noopener noreferrer">CReSCENT Documentation</a> (User Manual) is now available. A quick walkthrough of uploading your own data as well as accessing and exploring public datasets can be found on our <a href='https://www.youtube.com/playlist?list=PLdXeBakJd4aLCn2THd2cXyKAXqmGktu1s' target='_blank' rel="noopener noreferrer">Youtube playlist</a>. 
          </Segment>

          {/* <Segment>
            <Header content='Contact Us'/>
          </Segment> */}

          <Segment>
            <Header content='About Us'/>
            {/* CanceR Single Cell ExpressioN Toolkit (CReSCENT) is a scalable and standardized set of single-cell algorithmic methods, tools, and data portal deployed on high-performance computing infrastructure. To allow comparison of cells in cancerous and healthy tissues, the system will aggregate single-cell genomic data generated by cancer researchers and connect them to international reference data generated by experts from around the world. This data sharing and aggregation system is a key differentiating factor in CReSCENT that will increase researcher productivity by accelerating execution and comparison of computational methods, as well as providing contextual data for understanding how cells behave within tumour tissues. CReSCENT is available under an open source license via <a href='https://github.com/pughlab/crescent-frontend/blob/master/LICENSE' target='_blank' rel="noopener noreferrer">Github.</a> */}
            CReSCENT: CanceR Single Cell ExpressioN Toolkit is an intuitive and scalable web portal incorporating a containerized pipeline execution engine for standardized analysis of single-cell RNA sequencing data. CReSCENT is populated with public datasets and preconfigured pipelines that are accessible to computational biology non-experts, and user-editable to allow for optimization, comparison, and re-analysis on the fly. CReSCENT is under an open-source license via <a href='https://github.com/pughlab/crescent-frontend/blob/master/LICENSE' target='_blank' rel="noopener noreferrer">Github.</a>
            <br/>
            <br/>
            To reach the crescent.cloud portal-dev team and to report bugs or request features, please submit an issue to our <a href='https://github.com/pughlab/crescent-frontend/issues' target='_blank'>Github</a> or email us at <a href='mailto:crescent@uhnresearch.ca'>crescent@uhnresearch.ca</a>.
          </Segment>

          <Segment>
            <Header content='Privacy and Security Policy'/>
            Please review our <b>Privacy and Security Policy</b> and details on how to make your CReSCENT project public on the <a href='https://pughlab.github.io/crescent-frontend/#section-8' target='_blank' rel="noopener noreferrer">CReSCENT Docs</a>.
          </Segment>

          <Segment>
            <Header content='Citation'/>
            Suluxan Mohanraj, J Javier Díaz-Mejía, Martin D Pham, Hillary Elrick, Mia Husić, Shaikh Rashid, Ping Luo, Prabnur Bal, Kevin Lu, Samarth Patel, et al., CReSCENT: CanceR Single Cell ExpressioN Toolkit, <i>Nucleic Acids Research</i>, Volume 48, Issue W1, 02 July 2020, Pages W372–W379, <a href='https://doi.org/10.1093/nar/gkaa437' target='_blank' rel="noopener noreferrer">https://doi.org/10.1093/nar/gkaa437</a>.
          </Segment>

          <Segment>
            <Header content='Supported By'/>
            <Grid>
              <Grid.Row columns={5}>
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
                  <Image src={OG}/>
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