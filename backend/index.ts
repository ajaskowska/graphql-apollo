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
const resolvers = require('./graphql/resolvers');
const User = require('./models/User')
const Settings = require('./models/Settings');
const session = require('express-session');
// @ts-ignore
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import {makeExecutableSchema} from "@graphql-tools/schema";
import { isLoggedIn } from './helpers/isLoggedIn';
const { google } = require('googleapis');
const urlParse = require('url-parse');
const url = require('url')
const {authenticate} = require('@google-cloud/local-auth');
const expressPlayground = require('graphql-playground-middleware-express').default
const {OAuth2Client} = require('google-auth-library');
const passport = require('passport');
require('./auth');

async function startApolloServer() {

    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('hey gorgeous, you are connected to the database!!!'));

    const app = express();
    // const oauth2Client = new google.auth.OAuth2(
    //     //YOUR_CLIENT_ID,
    //     process.env.GOOGLE_CLIENT_ID,
    //     //YOUR_CLIENT_SECRET
    //     process.env.GOOGLE_CLIENT_SECRET,
    //     //YOUR_REDIRECT_URL
    //     process.env.GOOGLE_OAUTH_REDIRECT_URL
    // );
    // let userCredential: { access_token: string; } | null = null;



    // app.get('/login', (req, res) => {
    //
    //     // Access scopes for read-only Drive activity.
    //     const scopes = [
    //         'profile',
    //         'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'
    //     ];
    //     // Generate url that asks permissions for the Drive activity scope
    //     const authorizationUrl = oauth2Client.generateAuthUrl({
    //         // 'online' (default) or 'offline' (gets refresh_token)
    //         access_type: 'offline',
    //         scope: scopes,
    //         include_granted_scopes: true
    //
    //     });
    //     res.send(`Hello stranger, you have to log in so please click -> <a href=${authorizationUrl}> here </a>`);
    // })


    // app.get('/steps', async (req, res, next) => {
    //
    //     const queryURL = new urlParse(req.url);
    //
    //     const {tokens} = await oauth2Client.getToken(req.query.code);
    //     console.log("!!!!!!!!!!!!", tokens)
    //     console.log(req.query);
    //     if (tokens.refresh_token ){
    //          Settings.collection.drop();
    //          new Settings({ refreshtoken: tokens.refresh_token }).save();// store the refresh_token in my database!
    //     }
    //
    //
    //     // oauth2Client.setCredentials({tokens});
    //
    //     res.redirect('/graphql');
    //     })






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

    app.use(cors({
        origin: "http://localhost:3000",
        methods: "GET, POST, PUT, DELETE",
        credentials: true
    }));
    app.use(session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        },
    }));
    app.use(bodyParser.json());
    app.use(passport.initialize());
    app.use(passport.session());
    app.get('/', (req, res) => {
        res.send('<a href="/auth/google"> Authenticate with google</a>');
    })

    app.get('/auth/google',
        passport.authenticate('google', { scope: ['email', 'profile'], accessType: 'offline', prompt: 'consent'}))

    app.get('/google/callback',
        passport.authenticate('google', {
            successRedirect: 'http://localhost:3000/',
            // successRedirect: '/protected',
            failureRedirect: '/auth/failure'
        })
    )
    app.get('/protected', (req, res) => {
        console.log("!!!!!!!!!" , req.user)
        // res.end()
    })

    app.get('/auth/failure', (req, res) => {
        res.send('something went wrong. Login failed!')
    })

    app.get("/playground", expressPlayground({ endpoint: "/graphql" }));


    app.get("/logout", (req, res) => {
        // req.logout();
        //req.session.destroy();
        res.redirect("http://localhost:5000");
    })

    app.use(        //<-- set middleware
        '/graphql',
        expressMiddleware(server, {     //<-- add to apollo context
            context: async({ req }) => (
                {
                    // @ts-ignore
                    session: req.session,
                }),
        }),
    );

    await new Promise<void>((res) =>
        httpServer.listen({ port: 5000 }, res));
}

startApolloServer().then(() => console.log(`Server is ready at http://localhost:5000/`));