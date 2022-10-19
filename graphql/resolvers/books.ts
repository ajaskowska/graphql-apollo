import {ApolloError} from "apollo-server-errors";

const Book = require('../../models/Book');

module.exports = {
    Query: {
        async book(_: any, {ID}: any) {
            return await Book.findById(ID)
        },
        async getBooks(_: any, { offset, limit }:any) {
            return await Book.find().skip(offset).limit(limit);
        }
    },
    Mutation: {
        async addBook(_: any, {bookInput: {title, author, description, rating}}: any, context:any) {
            try{
                if(!context.user){
                    return new ApolloError(`user not logged in`)
                }
                const newBook = new Book({
                    title: title,
                    author: author,
                    description: description,
                    rating: rating
                });
                //mongodb save
                await newBook.save();
                return newBook;
            } catch (err){
                throw new ApolloError(`Error ${err}`)
            }
        },
        async deleteBook(_: any, {ID}: any) {
            const wasDeleted = (await Book.deleteOne({_id: ID,})).deletedCount;
            return wasDeleted;
            // return 1 if something was deleted = true, 0 if nothing = false
        },
        async editBook(_: any, {ID, bookInput: {title, author, description, rating}}: any) {
            const wasEdited = (await Book.updateOne({_id: ID}, {
                title: title,
                author: author,
                description: description,
                rating: rating
            })).modifiedCount;
            return wasEdited;
        }
    }
}