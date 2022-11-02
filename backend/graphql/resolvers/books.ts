import {ApolloError} from "apollo-server-errors";
import {IBook, IBookFilters, IBookInput} from "../../types/book";
import {TPagination} from "../../types/pagination";
const Book = require('../../models/Book');
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();


module.exports = {
    Query: {
        async book<T>(_: T, {ID}: IBook) {

            return await Book.findById(ID)
        },
        // async getBooks<T>(_: T, { offset, limit }:TPagination) {
        //     return await Book.find().skip(offset).limit(limit);
        // },
        async getFilteredBooks<T>(_:T, {bookFilters: {title, author, description, rating}}: IBookFilters, { offset, limit }:TPagination, context:any){
            console.log(context.session)
            const filter:any = {};
            if (title) filter.title = {$regex: title || '', $options: 'i'};
            if (author) filter.author = {$regex: author || '', $options: 'i'};
            if (description) filter.description = {$regex: description || '', $options: 'i'};
            if (rating) filter.rating = rating;

            return await Book.find(filter).skip(offset).limit(limit);
        }
    },
    Mutation: {
        async addBook<T>(_: T, {bookInput: {title, author, description, rating}}: IBookInput, context:any) {
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
                await pubsub.publish('BOOK_ADDED', { bookAdded: newBook });
                return newBook;
            } catch (err){
                throw new ApolloError(`Error ${err}`)
            }
        },
        async deleteBook<T>(_: T, {ID}: IBook) {
            const wasDeleted = (await Book.deleteOne({_id: ID,})).deletedCount;
            return wasDeleted;
            // return 1 if something was deleted = true, 0 if nothing = false
        },
        async editBook<T>(_: T, {ID, bookInput: {title, author, description, rating}}: IBookInput) {
            const wasEdited = (await Book.updateOne({_id: ID}, {
                title: title,
                author: author,
                description: description,
                rating: rating
            })).modifiedCount;
            return wasEdited;
        }
    },
    Subscription: {
        bookAdded: {
            subscribe: () =>
                pubsub.asyncIterator(['BOOK_ADDED'])


        },
    }
}