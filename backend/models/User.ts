
import {TUser} from "../types/types";

const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    username: {type: String, default: null},
    email: {type: String, unique: true},
    password: {type: String},
    role: { type: String, default: 'user' }
    // token: {type:String}
});


module.exports = model('User', userSchema)