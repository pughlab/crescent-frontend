const mongoose = require('mongoose')
const Promise = require('bluebird')
mongoose.Promise = Promise

const Schemas = require('./schema')

mongoose.connection.on('error', console.error.bind(console, 'Connection error, unable to connect to MongoDB'))
mongoose.connection.once('open', () => console.log('MongoDB connected'))
// Schema for 'user' model
mongoose.connection.model('user', Schemas.UserSchema)

module.exports = mongoose