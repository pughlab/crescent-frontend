const mongoose = require('mongoose')
//mongoose.connect('mongodb://mongo/crescent', {useNewUrlParser: true})
setTimeout(() => mongoose.connect('mongodb://mongo/crescent', {useNewUrlParser: true}), 500)


const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {

})

module.exports = db
