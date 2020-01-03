require('dotenv').config();
const mongooseConnection = require('mongoose').connection;
require('../database/mongo');
const apolloServer = require('./server');

mongooseConnection.once('open', () => {
    apolloServer
        .listen({ port: process.env.GRAPHQL_PORT })
        .then(({ url }) => console.log(`🚀  Server ready at ${url}`));
});
