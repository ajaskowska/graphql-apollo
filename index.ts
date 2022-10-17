const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

// const db = process.env.MONGODB_URI;

const server = new ApolloServer({
    typeDefs,
    resolvers
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
        return server.listen({ port: 4000 });
    })
    .then((res: Response) => {
        console.log(`server running at ${res.url}`);
    });