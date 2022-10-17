const { gql } = require('apollo-server');

module.exports = gql`

	type Book {
		title: String
		author: String
		description: String
		rating: Int
		
	}
	
	type User {
	    username: String
	    email: String
	    password: String
	    token: String
	}
	
	 input BookInput {
		title: String
		author: String
		description: String
		rating: Int
    }
    
    input RegisterInput {
        username: String
        email: String
        password: String
    }
    
    input LoginInput {
        email: String
        password: String
    }
 
	type Query {
	    book(ID: ID): Book!
        getBooks: [Book]
        user(ID: ID!):User!
    }
    type Mutation {
        addBook(bookInput: BookInput): Book!
        deleteBook(ID: ID!): Boolean
        editBook(ID: ID!, bookInput: BookInput): Boolean
        registerUser(registerInput: RegisterInput):User
        loginUser(loginInput: LoginInput): User
    }
   
  
    `;