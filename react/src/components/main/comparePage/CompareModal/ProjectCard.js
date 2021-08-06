import React from 'react';

import * as R from 'ramda'
import moment from 'moment'

import {Card, Header, Transition, Button, Label, Icon, Popup} from 'semantic-ui-react'
import { DatasetsPopoverContent } from '../../projectsPage/NewProjectModal/ExistingProjects';

const ProjectCard = ({
  project: {
    projectID,
    name,
    createdOn,
    createdBy: {name: creatorName},
    allDatasets
  },
  onClick,
  isSelected
}) => {

  const uniqueOncotreeCodesArray = R.compose(R.uniq, R.reject(R.isNil), R.pluck('oncotreeCode'))(allDatasets)

  return (
    <Transition visible animation='fade up' duration={1000} unmountOnHide={true} transitionOnMount={true}>
      <Card link 
        onClick={() => onClick(projectID)}
        color={isSelected ? 'blue' : 'grey'}
      >
        <Popup
          size='large' wide='very'
          trigger={
            <Button attached='top' color={isSelected ? 'blue' : 'grey'}>
              <Icon name={isSelected ? 'folder open' : 'folder outline'} size='large' />
            </Button>
          }        
        >
          <DatasetsPopoverContent {...{allDatasets}} />
        </Popup>
        <Card.Content extra>
          <Header size='small' content={name} />
        </Card.Content>
        <Card.Content>
          <Label.Group>
            <Label content={<Icon style={{margin: 0}} name='user' />} detail={creatorName} />
            <Label content={<Icon style={{margin: 0}} name='calendar alternate outline' />} detail={moment(createdOn).format('DD MMM YYYY')} />
            <Label content={<Icon style={{margin: 0}} name='upload' />} detail={`${R.length(allDatasets)} dataset(s)`} />
            {R.map(
                oncotreeCode => <Label key={oncotreeCode} content={<Icon style={{margin: 0}} name='paperclip' />} detail={oncotreeCode} />,
                uniqueOncotreeCodesArray
            )}
          </Label.Group>
        </Card.Content>
      </Card>
    </Transition>
  )
}
export default ProjectCard