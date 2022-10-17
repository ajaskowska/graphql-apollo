const {model, Schema} = require('mongoose');

const bookSchema = new Schema({
    title: String,
    author: String,
    description: String,
    rating: Number
});

module.exports = model('Book', bookSchema)