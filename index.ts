import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, {request} from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser, { json } from 'body-parser';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// @ts-ignore
const request = require('request');
dotenv.config();
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers/index');
const User =require('./models/User')
const session = require('express-session');
// @ts-ignore
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import {makeExecutableSchema} from "@graphql-tools/schema";
const { google } = require('googleapis');
const urlParse = require('url-parse');



async function startApolloServer() {

    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('hey gorgeous, you are connected to the database!!!'));

    const app = express();
    const oauth2Client = new google.auth.OAuth2(
        //YOUR_CLIENT_ID,
        process.env.GOOGLE_CLIENT_ID,
        //YOUR_CLIENT_SECRET
        process.env.GOOGLE_CLIENT_SECRET,
        //YOUR_REDIRECT_URL
        process.env.GOOGLE_OAUTH_REDIRECT_URL
    );


    // app.get('/login', (req, res) => {
    //     res.send("Hello")
    // })
    app.get('/login', (req, res) => {
        // res.send("hello world");

        // Access scopes for read-only Drive activity.
        const scopes = [
            'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/calendar'
        ];
        // Generate url that asks permissions for the Drive activity scope
        const authorizationUrl = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            /** Pass in the scopes array defined above.
             * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
            scope: scopes,
            // Enable incremental authorization. Recommended as a best practice.
            include_granted_scopes: true


        });
        // console.log(authorizationUrl);
        res.send(`Hello stranger, you have to log in so please click -> <a href=${authorizationUrl}> here </a>`);



    })
    app.get('/steps', async (req, res) => {
        const { tokens } = await oauth2Client.getToken(req.query.code);
        console.log(tokens)
        //oauth2Client.setCredentials({refresh_token});

        res.send("logged in");
        const queryURL = new urlParse(req.url);
        // const code = queryParse.parse(queryURL.query)
        console.log(req.query);
    })


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
        path: '/graphql',
    });

    const serverCleanup = useServer({ schema }, wsServer);

    await server.start();
    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        bodyParser.json(),
        session({
            secret: 'qwerty123',
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
        httpServer.listen({ port: 5000 }, res));
}

startApolloServer().then(() => console.log(`Server is ready at http://localhost:5000/`));