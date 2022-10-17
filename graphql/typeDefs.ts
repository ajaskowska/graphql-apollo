const { gql } = require('apollo-server');

module.exports = gql`

	type Book {
		title: String
		author: String
		description: String
		rating: Int
		
	}
	 input BookInput {
		title: String
		author: String
		description: String
		rating: Int
    }
 
	type Query {
	    book(ID: ID): Book!
        getBooks: [Book]
    }
    type Mutation {
        addBook(bookInput: BookInput): Book!
        deleteBook(ID: ID!): Boolean
        editBook(ID: ID!, bookInput: BookInput): Boolean
    }
   
  
    `;