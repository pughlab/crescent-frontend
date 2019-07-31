const mongoose = require('mongoose')
const Promise = require('bluebird')
const Schema = mongoose.Schema
mongoose.Promise = Promise

mongoose.connection.on('error', console.error.bind(console, 'Connection error, unable to connect to MongoDB'))
mongoose.connection.once('open', () => console.log('MongoDB connected'))
// Schema for 'user' model
mongoose.connection.model(
  'user',
  new mongoose.Schema({
    userID: {
      type: Schema.Types.ObjectId,
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
)

module.exports = mongoose