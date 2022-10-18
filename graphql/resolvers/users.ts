const User = require('../../models/User');
// const {ApolloError} = require('apollo-server-errors');
import { GraphQLError } from 'graphql';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    Mutation: {
        async registerUser(_: any, {registerInput: {username, email, password}}: any) {
            //check if user exist = email already in db
            const oldUser = await User.findOne({email});
            if (oldUser) {
                throw new GraphQLError(`${email} already registered`)
            }
            //    encrypt password using bcrypt (pass + salt)
            const encryptedPassword = await bcrypt.hash(password, 10);

            //mongoose USER model
            const newUser = new User({
                username: username,
                email: email.toLowerCase(),
                password: encryptedPassword
            });

            //    create token using JWT
            const token = jwt.sign(
                {user_id: newUser._id, email},
                "zazolc_gesia_jazn",
                {expiresIn: '5h'}
            );
            newUser.token = token;
        //    save user in db
            const res = await newUser.save();
            return{
                id: res.id,
                ...res._doc
            };
        },
        async loginUser(_: any, {loginInput: {email, password}}: any, context: any){
            //check if user = email exists
            const user = await User.findOne({email});
            // check if entered password = encrypted password
            if(user && (await bcrypt.compare(password, user.password))){
                // yes => create NEW token
                const token = jwt.sign(
                    {user_id: user._id, email},
                    "zazolc_gesia_jazn",
                    {expiresIn: '5h'}
                );
                // attach token to user above
                user.token = token;
        // SESSION
                context.session.username = user.username;
                return{
                    id: user.id,
                    ...user._doc
                }
            }else {
                // if user doesn't exist, return error
                throw new GraphQLError('incorrect credentials')
            }

        },
        async logout(_:any, {}, context:any) {
            context.session.destroy();
            return true;
        }
    },
    Query:{
        async user(_: any, {ID}: any) {
            return await User.findById(ID)
        }
    }
}