// @ts-ignore
const { model, Schema } = require('mongoose');

// @ts-ignore
const bookSchema = new Schema({
    title: String,
    author: String,
    description: String,
    rating: Number
});

module.exports = model('Book', bookSchema)