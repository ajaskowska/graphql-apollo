// @ts-ignore
const { model, Schema } = require('mongoose');

// @ts-ignore
const settingsSchema = new Schema({
    refreshtoken: String

});

module.exports = model('Settings', settingsSchema)