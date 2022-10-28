const booksResolvers = require('./books');
const usersResolvers = require('./users');
const calendarResolvers = require('./calendar');

module.exports = {
    Query: {
        ...booksResolvers.Query,
        ...usersResolvers.Query,
        ...calendarResolvers.Query
    },
    Mutation: {
        ...booksResolvers.Mutation,
        ...usersResolvers.Mutation,
        ...calendarResolvers.Mutation

    },
    Subscription: {
        ...booksResolvers.Subscription
    }
};


