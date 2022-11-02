const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
import Settings from './models/Settings';

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/google/callback",
        passReqToCallback: true,
    },
// @ts-ignore
    async function (request, accessToken, refreshToken, profile, done) {
        // console.log(profile);
        // console.log("access token", accessToken);
        // console.log('refresh', refreshToken)
        await Settings.collection.drop();
        await new Settings({ refreshToken }).save();
        done(null, profile);
    }
));

// @ts-ignore
passport.serializeUser(function (user, done) {
    done(null, user);
});
// @ts-ignore
passport.deserializeUser(function (user, done) {
    done(null, user);
});