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
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  }
})

module.exports = UserSchema