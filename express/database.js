const mongoose = require('mongoose')

setTimeout(() => mongoose.connect('mongodb://mongo/crescent', {useNewUrlParser: true}), 50000)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {

})

module.exports = db