module.exports = `#graphql

	type Calendar {
	    summary: String
        organizer: String
        start: String
        end: String
        hangoutLink: String
	}
	
	type Book {
		title: String
		author: String
		description: String
		rating: Int
	}
	
	input BookFilters {
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
	
	type User {
	    username: String
	    email: String
	    password: String
	    role: String
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
        getFilteredBooks(bookFilters: BookFilters, limit: Int, offset:Int): [Book]
        user(ID: ID!):User!
        getCalendar: [Calendar]
    }
    
    type Mutation {
        addBook(bookInput: BookInput): Book!
        deleteBook(ID: ID!): Boolean
        editBook(ID: ID!, bookInput: BookInput): Boolean
        registerUser(registerInput: RegisterInput):User
        loginUser(loginInput: LoginInput): User
        logout: Boolean
        addCalendarEvent(summary: String, organizer: String, start: String, end: String, hangoutLink: String): Calendar
    }
    
    type Subscription {
        bookAdded: Book
    }
    `;