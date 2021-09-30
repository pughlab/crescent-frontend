import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { interpret } from 'xstate'

import { initiallyIdleMachine } from '../redux/helpers/machines/initiallyIdleMachine'
import { initiallyLoadingMachine } from '../redux/helpers/machines/initiallyLoadingMachine';
import { QCMachine } from '../redux/helpers/machines/QCMachine';

const queryIsNotNil = R.curry(
  (query, data) => R.both(
    RA.isNotNilOrEmpty,
    R.propSatisfies(RA.isNotNil, query)
  )(data)
)

const plotQueryFields = [
  'plotQueryID',
  'activeResult',
  'selectedQC',
  'selectedFeature',
  'selectedFeatures',
  'selectedScaleBy',
  'selectedExpRange',
  'selectedGroup',
  'selectedAssay',
  'selectedDiffExpression',
  'selectedQCDataset',
  'selectedInferCNVType'
 ]

// converting selectedExpRange to float, remove __typename, rename id to plotQueryID
 const cleanUpPlotQuery = R.compose(
  // rename id to plotQueryID
  RA.renameKeys({ id: 'plotQueryID'}),
  // keep plotQuery fields, id and runID
  R.pick(R.concat(['id', 'runID'], plotQueryFields)),
  // convert selectedExpRange to float
  R.evolve({
    selectedExpRange: R.map(str => parseFloat(str)),
  })
)

const getMachine = ({activeResult, selectedFeature, selectedFeatures, selectedQC}) => {
  return R.cond([
  [R.includes(R.__, ['violin']),   R.always(initiallyIdleMachine(selectedFeature ? 'initialLoading' : 'idle'))],
  [R.includes(R.__, ['dot']),   R.always(initiallyIdleMachine(R.isEmpty(selectedFeatures) ? 'idle' : 'initialLoading'))],
  [R.includes(R.__, ['infercnv', 'gsva']),   R.always(initiallyIdleMachine('initialLoading'))],
  [R.includes(R.__, ['tsne', 'umap']),   R.always(initiallyLoadingMachine(selectedFeature ? 'initialOpacityLoading' : 'initialScatterLoading'))],
  [R.includes(R.__, ['qc']),   R.always(QCMachine(R.equals(selectedQC, 'Before_After_Filtering') ? 'initialViolinLoading' : 'initialUmapLoading'))],
])(activeResult)
}

const initiateService = (plotQuery) => ({
  ...plotQuery,
  service: interpret(getMachine(plotQuery)).start()
})

export {
  queryIsNotNil,
  plotQueryFields,
  cleanUpPlotQuery,
  getMachine,
  initiateService
}