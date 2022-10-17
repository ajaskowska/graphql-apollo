const Book = require('../models/Book');

// @ts-ignore
module.exports = {
    Query:{
        async book(_: any, {ID}: any){
         return await Book.findById(ID)
        },
        async getBooks(){
            return  await Book.find()
        }
    },
    Mutation:{
        async addBook(_: any, {bookInput: {title, author, description, rating}}: any){
            const newBook = new Book({
                title:title,
                author:author,
                description:description,
                rating:rating
            });
            //mongodb save
            const res = await newBook.save();

            return {
                id: res.id,
                ...res._doc
            };
        },
        async deleteBook(_: any, {ID}: any){
            const wasDeleted = (await Book.deleteOne({_id:ID,})).deletedCount;
            return wasDeleted;
            // return 1 if something was deleted = true, 0 if nothing = false
        },
        async editBook(_: any, {ID, bookInput: {title, author, description, rating}}: any){
            const wasEdited = (await Book.updateOne({_id:ID }, {title:title, author:author, description:description, rating:rating})).modifiedCount;
            return wasEdited;

        }

    }
}