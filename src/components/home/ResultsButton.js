import React, {useState, useEffect} from 'react';

import { Icon, Input, Menu, Dropdown, Header, Segment, Button, Label, Grid, Image, Modal, Divider, Step, Card } from 'semantic-ui-react'

const CWLResultsButton = ({
  step,
  onClick,
  active
}) => (
  <Step onClick={onClick} >
    <Step.Content title={step} description='Seurat' />
  </Step>
)

export default CWLResultsButton