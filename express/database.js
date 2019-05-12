const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/crescent', {useNewUrlParser: true})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {

})

module.exports = db