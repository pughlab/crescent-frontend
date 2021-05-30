const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  email: {
    type: String,
    required: true
  },
  keycloakUserID: {
    type: String,
    required: true
  },
  // password: {
  //   type: String,
  //   required: false
  // },
  // firstName: {
  //   type: String,
  //   required: false
  // },
  // lastName: {
  //   type: String,
  //   required: false
  // },
  name: {
    type: String,
    required: true
  },
  // sessionToken: {
  //   // type: mongoose.Schema.Types.ObjectId,
  //   type: String,
  //   default: null
  // }
})

module.exports = UserSchema