import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers/index');
const User =require('./models/User')
const session = require('express-session');
// @ts-ignore
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import {makeExecutableSchema} from "@graphql-tools/schema";


// const server = new ApolloServer({
//     typeDefs,
//     resolvers
// });
//
// mongoose
//     .connect(process.env.MONGODB_URI)
//     .then(() => {
//         console.log('MongoDB connected');
//         return server.listen({ port: 4000 });
//     })
//     .then((res: Response) => {
//         console.log(`server running at ${res.url}`);
//     });
async function startApolloServer() {

    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to the database!'));

    const app = express();

    const httpServer = http.createServer(app);

    const schema = makeExecutableSchema({ typeDefs, resolvers });


    const server = new ApolloServer({
        schema,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            }
            ],
    });

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/',
    });

    const serverCleanup = useServer({ schema }, wsServer);

    await server.start();
    app.use(
        '/',
        cors<cors.CorsRequest>(),
        json(),
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
            },
        }),
        expressMiddleware(server, {
            context: async({ req }: any) => (
                {
                    session: req.session,
                    user: await User.findOne({ username: req.session.username })
                }),
        }),
    );
    await new Promise<void>((res) =>
        httpServer.listen({ port: 4000 }, res));
}

startApolloServer().then(() => console.log(`Server ready at http://localhost:4000/`));