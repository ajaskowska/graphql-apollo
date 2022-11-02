import {google} from "googleapis";

const Settings = require("../models/Settings");

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

export const authGoogle: any = async () => {
    const token = await Settings.find();
    const refreshToken = token[0].refreshToken;

    return oauth2Client.setCredentials({refresh_token: refreshToken});
};