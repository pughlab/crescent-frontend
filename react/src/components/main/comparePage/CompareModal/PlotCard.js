import React from 'react';
import * as R from 'ramda'

import {Header, Button, Label, Icon, Card, Transition} from 'semantic-ui-react'
import moment from 'moment'

import {useDispatch} from 'react-redux'
import {useComparePage} from '../../../../redux/hooks'
import {addPlots, removePlots} from '../../../../redux/slices/comparePage'

const PlotCard = ({
	plot
}) => {  
  const dispatch = useDispatch()
  const {plotQueries} = useComparePage()
  const {
    projectName,
    runName, 
    runID, 
    query, 
    allDatasets,
    createdOn,
    ownerName,
    query: {
      id,
      activeResult,
      selectedQCDataset, 
      selectedQC,
      selectedDiffExpression,
      selectedFeature,
      selectedFeatures,
      selectedGroup,
      selectedScaleBy,
      selectedInferCNVType
    }
  } = plot
  
  const isSelected = R.includes(id, R.pluck('plotQueryID', plotQueries))

  return (
    <Transition visible animation='fade up' duration={1000} unmountOnHide={true} transitionOnMount={true}>
      <Card link
        color={isSelected ? 'blue' : 'grey'}
        onClick={
          () => isSelected 
          ? dispatch(removePlots({value: [id]})) 
          : dispatch(addPlots({value: [{...query, runID}]}))
        }
      >
        <Button 
          attached='top'
          color={isSelected ? 'blue' : null}
        >
          <Header 
            size="small"
            textAlign="center" 
            style={{margin: 0, color: isSelected && "#ffffff" }} 
            icon={<span><Icon name="area graph" size='large' /></span>}
            content={R.toUpper(query.activeResult)}
          />
          <Header 
            size="small"
            textAlign="center" 
            style={{margin: 0, color: isSelected && "#ffffff"}} 
            content={`${projectName} - ${runName}`}
          />
          <p>{`Created on ${moment(createdOn).format('D MMMM YYYY')} by ${ownerName}`}</p>
        </Button>
        <Card.Content>
          <Label.Group>
            {
              R.cond([
                [R.equals('qc'), R.always(
                  <>
                    <Label content='Dataset' detail={R.prop('name', R.find(R.propEq('datasetID', selectedQCDataset))(allDatasets))} />
                    <Label content='Quality control' detail={selectedQC} />
                  </>
                )],
                [R.equals('dot'), R.always(
                  <>
                    <Label content='Colour by' detail={selectedGroup} />									
                    <Label content='Genes' detail={R.isEmpty(selectedFeatures) ? 'None' : R.join(', ', selectedFeatures)} />
                    <Label content='Scale by' detail={selectedScaleBy} />
                  </>
                )],
                [R.includes(R.__, ['infercnv']), R.always(
                  <Label content='Type' detail={selectedInferCNVType} />
                )],
                [R.includes(R.__, ['gsva']), R.always(
                  <Label content='No parameter selected'/>
                )],
                // tsne, umap, violin
                [R.T, R.always(
                  <>
                    <Label content='Dataset' detail={R.equals(selectedDiffExpression, 'All') ? 'All' : R.prop('name', R.find(R.propEq('datasetID', selectedDiffExpression))(allDatasets))} />
                    <Label content='Colour by' detail={selectedGroup} />
                    <Label content='Gene' detail={R.isNil(selectedFeature) ? 'None' : selectedFeature} />
                  </>
                )]
              ])(activeResult)
            }
          </Label.Group>
          
        </Card.Content>
      </Card>
    </Transition>
  )
}

export default PlotCard