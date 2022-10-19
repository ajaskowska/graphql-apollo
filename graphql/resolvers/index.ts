const booksResolvers = require('./books');
const usersResolvers = require('./users');

module.exports = {
    Query: {
        ...booksResolvers.Query,
        ...usersResolvers.Query,
    },
    Mutation: {
        ...booksResolvers.Mutation,
        ...usersResolvers.Mutation,

    },
    Subscription: {
        ...booksResolvers.Subscription
    }
};


