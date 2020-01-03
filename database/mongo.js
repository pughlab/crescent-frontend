const mongoose = require('mongoose');
const Schemas = require('./schema');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB at", process.env.MONGO_URL)).catch(console.log);

const Models = {};
for (let schema in Schemas) {
    const model = schema.slice(0, -"Schema".length);
    Models[model] = mongoose.model(model.toLowerCase(), Schemas[schema]);
    console.log("Created MongoDB model", model);
}

module.exports = Models;
