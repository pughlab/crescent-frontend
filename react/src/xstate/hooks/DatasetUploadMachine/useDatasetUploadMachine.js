import { useMachine } from '@xstate/react'
import { InputUploadMachine } from '../../machines'

const useDatasetUploadMachine = createDataset => {
  const [state, send] = useMachine(InputUploadMachine({
    uploadFunction: uploadOptions => new Promise(async (resolve, reject) => {
      try {
        const { data: { createDataset: createDatasetResults } } = await createDataset(uploadOptions)
        resolve({ data: createDatasetResults })
      } catch {
        reject()
      }
    })
  }))

  return [state, send]
}

export default useDatasetUploadMachine