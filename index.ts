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
const User = require('./models/User')
const Settings = require('./models/Settings');
const session = require('express-session');
// @ts-ignore
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import {makeExecutableSchema} from "@graphql-tools/schema";
const { google } = require('googleapis');
const urlParse = require('url-parse');
const url = require('url')
const {authenticate} = require('@google-cloud/local-auth');



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
    let userCredential: { access_token: string; } | null = null;


    app.get('/login', (req, res) => {

        // Access scopes for read-only Drive activity.
        const scopes = [
            'profile',
            'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'
        ];
        // Generate url that asks permissions for the Drive activity scope
        const authorizationUrl = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            scope: scopes,
            include_granted_scopes: true

        });
        res.send(`Hello stranger, you have to log in so please click -> <a href=${authorizationUrl}> here </a>`);
    })


    app.get('/steps', async (req, res) => {


        const queryURL = new urlParse(req.url);

                const {tokens} = await oauth2Client.getToken(req.query.code)
                // console.log(tokens.refresh_token)
                // if (tokens.refresh_token) {
                //     Settings.findOne({profileId: profile.id}).then((currentUser) => {
                //         if (currentUser) {
                //             //    user already exists
                //             console.log("user is: ", currentUser);
                //         } else {
                //             //    save new user to db
                //             new Settings({
                //                 profileId: profile.id,
                //                 refreshToken: refreshToken
                //             }).save().then((newUser) => {
                //                 console.log("new user: " + newUser);
                //             });
        await Settings.collection.drop();
        await new Settings({ refreshtoken: tokens.refresh_token }).save();

                    // const newRefreshToken = new Settings({
                    //     refreshtoken: tokens.refresh_token
                    // })
                    // newRefreshToken.save();// store the refresh_token in my database!
        console.log(req.query)
        //         oauth2Client.setCredentials({tokens});
        // userCredential = tokens;
        console.log(tokens);
        res.redirect('/graphql');



        // const calendar = google.calendar({version: 'v3', auth: oauth2Client});
        // console.log("calendar", calendar)
        // const response = await calendar.events.list({
        //     calendarId: 'primary',
        //     maxResults: 10,
        //     singleEvents: true
        // });
        // console.log("!!!!!!", response.data.items)
        // const events = response.data.items;
        // if (!events || events.len gth === 0) {
        //     console.log('No upcoming events found.');
        //     return;
        // }
        // console.log('Upcoming 10 events:');
        // // @ts-ignore
        // events.map((event, i) => {
        //     const start = event.start.dateTime || event.start.date;
        //     console.log(`${start} - ${event.summary}`);
        // });
        // res.send('logged in')


        })
    app.get('/revoke', (res, req)=>{
        // Example on revoking a token
            // Build the string for the POST request
            // @ts-ignore
        let postData = "token=" + userCredential.access_token;
        console.log("POST DATA ", postData)

            // Options for POST request to Google's OAuth 2.0 server to revoke a token
            let postOptions = {
                host: 'oauth2.googleapis.com',
                port: '443',
                path: '/revoke',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            // Set up the request
            const postReq = http.request(postOptions, function (res) {
                res.setEncoding('utf8');
                res.on('data', d => {
                    console.log('Response: ' + d);
                });
            });

            postReq.on('error', error => {
                console.log(error)
            });

            // Post the request with data
            postReq.write(postData);
            postReq.end();




    } )

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