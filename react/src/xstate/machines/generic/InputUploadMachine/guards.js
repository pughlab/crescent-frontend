// Checks if the uploaded input is valid
const isInputValid = ({ inputCondition }, { data: { data } }) => inputCondition(data)

export {
  isInputValid
}