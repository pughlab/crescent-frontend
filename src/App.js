import React, {Component, useState} from 'react';
import './App.css';

import { Icon, Menu, Popup, Header, Segment, Button, Label, Grid, Image, Modal, Divider } from 'semantic-ui-react'

import tsne from './tsne.png'
import logo from './logo.svg'

const VisualizationComponent = ({
  visContent,
  setVisContent
}) => {

  return (
    <Segment attached='top' style={{height: '90%'}} >
      <Grid style={{height: '100%'}}>
        <Grid.Column width={12}>
          <Segment style={{height: '100%'}} >
          <Header content={
              visContent=='Home' ?
              'Home plot here'
              : visContent=='Alignment' ?
              'Alignment plot here'
              : visContent=='Normalization' ?
              'Normalization plot here'
              : visContent=='Clustering' ?
              'Clustering plot here'
              : 'No plots'
            }
          />
          <Divider />
          <Image size='big' src={tsne} />
          </Segment>
        </Grid.Column>
        <Grid.Column width={4} style={{height: '100%'}}>
          <Segment style={{height: '40%'}} placeholder>
            <Label color='green' attached='top' content='Visualization Panel' />
            {visContent}
          </Segment>
          <Segment style={{height: '40%'}} placeholder>
            <Label color='blue' attached='top' content='Logs' />
            {visContent}
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  )
}

const MenuComponent = ({
  visContent,
  setVisContent
}) => {
  return (
        <Segment attached='bottom' style={{height: '10%'}} as={Menu} size='huge'>
          <Menu.Item
            header
            icon='moon'
            content='CReSCENT'
          />
          <Menu.Item />
          <Modal
            trigger={
              <Menu.Item content={
                <Button color='red' content='Upload' icon='upload' labelPosition='left'/>
              } />
            }
            header='Upload Workflow Inputs Here'
            content='Upload API stuff here'
            actions={
              [
                <Button key='submit' content='Submit uploads' />
              ]
            }
          />
          {
            [
              {step: 'Alignment', icon: 'align justify'},
              {step: 'Normalization', icon: 'align center'},
              {step: 'Clustering', icon: 'hubspot'}
            ].map(
              ({step, icon}) => (
                <Popup  key={step}
                  position='top center'
                  on='click'
                  trigger={
                    <Menu.Item>
                      <Button labelPosition='left' icon={icon} content={step} />
                    </Menu.Item>
                  }
                  content={
                    <Button.Group size='big' widths={2}>
                      <Button content='Results' color='blue'
                        icon='clipboard check'
                        labelPosition='left'
                        onClick={() => setVisContent(step)}
                      />
                      <Button.Or />
                      <Modal
                        trigger={
                            <Button 
                              icon='clipboard list'
                              labelPosition='right'
                            content='Parameters' color='green' />
                        }
                      >
                        <Modal.Header content={step} />
                        <Modal.Content>
                          <Grid>
                            <Grid.Column width={4}>
                              <Menu fluid vertical tabular='left'>
                              {
                                ['Param1', 'Param2', 'Param3'].map(
                                  param => (
                                    <Menu.Item key={param} content={param} onClick={() => console.log(param)}/>
                                  )
                                )
                              }
                              </Menu>
                            </Grid.Column>
                            <Grid.Column stretched width={12}>
                              <Segment>
                                Parameter selection here
                              </Segment>
                            </Grid.Column>
                          </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                          <Button content='Confirm' />
                        </Modal.Actions>
                      </Modal>
                    </Button.Group>
                  }
                />


              )
            )
          }

          <Menu.Menu position='right'>
            <Menu.Item>
              <Button content='Submit' icon='cloud upload' labelPosition='left' color='blue' />
            </Menu.Item>
          </Menu.Menu>
        </Segment>
  )
}

const App = ({

}) => {
    const [visContent, setVisContent] = useState('Home')
    return (
      <Segment style={{height: '100%'}}>
        <VisualizationComponent
          visContent={visContent}
          setVisContent={setVisContent}
        />
        <MenuComponent
          visContent={visContent}
          setVisContent={setVisContent}
        />
      </Segment>
    )
  }

  export default App
