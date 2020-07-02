import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Button, Form, Divider, Segment, Popup, Label, Icon, Header, Grid } from 'semantic-ui-react'


import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useAvailableGroupsQuery, useTopExpressedQuery} from '../../../../apollo/hooks'
import changeSelectedFeature from '../../../../redux/actions/thunks'
import changeActiveGroup from '../../../../redux/actions/thunks'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const VisualizationMenu = ({
}) => {   
  
  const [currentSearch, changeSearch] = useState('')
  const [currentOptions, changeCurrentOptions] = useState([])
  
  const {runID} = useCrescentContext()
  console.log("RUNID: ", runID)
  const dispatch = useDispatch()
  const {selectedFeature, selectedGroup} = useResultsPage()
  //available groups & top expressed must be queries
  
  const availableGroups = useAvailableGroupsQuery(runID)
  const topExpressed = useTopExpressedQuery(runID)

  
  if (R.any(R.isNil, [availableGroups, topExpressed])) {
    console.log(availableGroups, topExpressed)
    return null
  }

  console.log("AVAILABLE GROUPS QUERY RESULT: ", availableGroups) 
  //HERE CHECK RESPONSE, HANDLE SEARCH CHANGE, SELECT FEATURE
  //RESET FEATURE, FEATURE BUTTON


  const checkResponse = (resp) => {
    if(!resp.ok){throw Error(resp.statusText);}
    return resp
  }

  //UNSURE
  // const handleSearchChange = (event, {searchQuery}) => {
  //   changeSearch(searchQuery)
  //   if (RA.isNotEmpty(searchQuery)) {
  //     fetch(`/express/search/${searchQuery}/${runID}`)
  //       .then(checkResponse)
  //       .then(resp => resp.json())
  //       .then(changeCurrentOptions)
  //       .catch((err) => console.log(err))
  //   }
  // }

  const handleSelectFeature = (event, {value}) => {
    changeSearch('') // reset search
    changeSelectedFeature(value) // store
  }

  const resetSelectFeature = () => {
    changeSearch('')
    changeCurrentOptions([])
    changeSelectedFeature(null)
  }

  const availableGroupsArray = R.compose(
    R.head,
    R.values
  )(availableGroups)

  
  // format a list for a dropdown
  const formatList = R.addIndex(R.map)((val, index) => ({key: index, text: val, value: val}))

  console.log("AVAILABLE GROUPS:", availableGroupsArray)
  console.log("SELECTED GROUPS:", selectedGroup)

  
  return(
    <Form>
      <Divider horizontal content='Colour By' />
        <Form.Field>
            <Form.Dropdown
              fluid
              selection
              labeled
              defaultValue={RA.isNotNil(selectedGroup) ? selectedGroup : availableGroupsArray[0]}
              options={formatList(availableGroups)}
              onChange={(event, {value}) => console.log(value)}
              //onChange={(event, {value}) => changeActiveGroup(value)}
            />
          </Form.Field>
        <Divider horizontal />
        <Form.Field>
        {/* Reset feature selection */}
        <Form.Button
          fluid
          animated='vertical'
          color='violet'
          disabled={R.isNil(selectedFeature)}
          onclick={console.log("OK")}
          //onClick={resetSelectFeature}
        >
          <Button.Content visible>
          {
            RA.isNotNil(selectedFeature) ? selectedFeature : 'Select or Search for a Gene'
          }
          </Button.Content>
          <Button.Content hidden>
          {
            RA.isNotNil(selectedFeature) && 'Click to Reset'
          }
          </Button.Content>
        </Form.Button>
      </Form.Field>
      </Form>
  )
}


//   return (
//     <Form>
//       <Divider horizontal content='Colour By' />
//       <Form.Field>
//         <Form.Dropdown
//           fluid
//           selection
//           labeled
//           defaultValue={RA.isNotNil(selectedGroup) ? selectedGroup : availableGroups[0]}
//           options={formatList(availableGroups)}
//           onChange={(event, {value}) => changeActiveGroup(value)}
//         />
//       </Form.Field>
//       <Divider horizontal />
//       <Form.Field>
//         {/* Reset feature selection */}
//         <Form.Button
//           fluid
//           animated='vertical'
//           color='violet'
//           disabled={R.isNil(selectedFeature)}
//           onClick={resetSelectFeature}
//         >
//           <Button.Content visible>
//           {
//             RA.isNotNil(selectedFeature) ? selectedFeature : 'Select or Search for a Gene'
//           }
//           </Button.Content>
//           <Button.Content hidden>
//           {
//             RA.isNotNil(selectedFeature) && 'Click to Reset'
//           }
//           </Button.Content>
//         </Form.Button>
//       </Form.Field>
//       <Divider horizontal content='Search Genes' />
//       <Form.Dropdown
//         placeholder={"Enter Gene Symbol"}
//         fluid
//         search
//         searchQuery={currentSearch}
//         selection
//         options={currentOptions}
//         value={selectedFeature}
//         onSearchChange={handleSearchChange}
//         onChange={handleSelectFeature}
//       />
//       <Divider horizontal content='Top Differentially Expressed Genes' />

//       {
//         RA.isNotEmpty(topExpressed) &&
//         <Segment basic
//           style={{maxHeight: '40vh', overflowY: 'scroll'}}
//         >
//           {
//             R.compose(
//               R.map(
//                 ([cluster, features]) => (
//                   <Segment key={cluster} compact>
//                     <Label attached='top' content={`Cluster ${cluster}`} />
//                     {R.map(featureButton, features)}
//                   </Segment>
//                 )
//               ),
//               R.toPairs,
//               R.groupBy(R.prop('cluster'))
//             )(topExpressed)
//           }
//         </Segment>
//       }
//       </Form>
//   )
// })

 export default VisualizationMenu 