import {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

// const ReportBugModal = ({
// }) => {
//   return (
//     <Popup inverted size='large'
//       trigger={
//         <Button color='grey' basic inverted icon size='large' 
//         target='_blank'
//         href={'https://github.com/pughlab/crescent-frontend/issues/new/choose'}
//         >
//           <Icon color='black' size='big' name='bug' />
//         </Button>
//       }
//       content={
//         'Report Bug'
//       }
//     />
//   )
// }

const ReportBugModal = ({
}) => {
  const [open, setOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState('forms')
  const isActiveMenu = R.equals(activeMenu)

  return (
    <>
    <Popup inverted size='large'
      trigger={
        <Button color='grey' basic inverted icon size='large'
          onClick={() => setOpen(!open)} 
        >
          <Icon color='black' size='big' name='bug' />
        </Button>
      }
      content={
        'Report Bug'
      }
    />
    <Modal
      {...{open}}
      closeIcon
      onClose={() => setOpen(!open)}
      // closeOnDimmerClick={false}

    >
      <Modal.Content>
        <Divider horizontal>
          Send us a bug report/feature request or email us at <a target="_blank" href='mailto:crescent@uhnresearch.ca' >crescent@uhnresearch.ca</a> 
        </Divider>          
        <Button.Group fluid widths={2}>
          <Button content='Google Forms'
            icon='google'
            active={isActiveMenu('forms')} 
            color={R.equals(activeMenu, 'forms') ? 'violet' : undefined}
            onClick={() => setActiveMenu('forms')}
          />
          <Button.Or />
          <Button content='GitHub'
            icon='github'
            active={isActiveMenu('github')} 
            color={R.equals(activeMenu, 'github') ? 'black' : undefined}
            onClick={() => setActiveMenu('github')}
          />
        </Button.Group>
        {
          isActiveMenu('forms') ?
          <Segment color='violet'>
            <Button fluid inverted color='red' size='massive'
              content='Bug Report'
              target='_blank'
              href={'https://forms.gle/Bd1jbyjYUno51qs18'}
            >
            </Button> 
            <Divider/>
            <Button fluid inverted color='green' size='massive'
              content='Feature Request'
              target='_blank'
              href={'https://forms.gle/WAheMM3UP9GwibPv5'}
            >
            </Button> 
          </Segment>
          :
          <Segment color='black'>
            <Button fluid inverted color='red' size='massive' 
              content='Bug Report'
              target='_blank'
              href={'https://github.com/pughlab/crescent-frontend/issues/new?assignees=&labels=&template=bug_report.md&title=%5BBUG%5D'}
            >
            </Button> 
            <Divider/>
            <Button fluid inverted color='green' size='massive'
              content='Feature Request'
              target='_blank'
              href={'https://github.com/pughlab/crescent-frontend/issues/new?assignees=&labels=&template=feature_request.md&title=%5BFEATURE%5D'}
            >
            </Button> 
          </Segment>
        }
      </Modal.Content>
    </Modal>
    </>
  )
}

export default ReportBugModal