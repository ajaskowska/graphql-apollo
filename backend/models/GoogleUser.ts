// @ts-ignore
const { model, Schema } = require('mongoose');

const GoogleUserSchema = new Schema({
    username: String,
    googleId: String,
    refreshToken: String
});

module.exports = model('GoogleUser', GoogleUserSchema)
