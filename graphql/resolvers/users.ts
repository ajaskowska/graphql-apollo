import {ApolloError} from "apollo-server-errors";

const User = require('../../models/User');
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
            try {
                const encryptedPassword = await bcrypt.hash(password, 10);
                //mongoose USER model
                const newUser = new User({
                    username: username,
                    email: email.toLowerCase(),
                    password: encryptedPassword
                });

                //    save user in db
                await newUser.save();
                return newUser;
            } catch (err) {
                throw new ApolloError(`Error ${err}`)
            }



        },
        async loginUser(_: any, {loginInput: {email, password}}: any, context: any){
            try{
                //check if user = email exists
                const user = await User.findOne({email});
                // check if entered password = encrypted password
                if(user && (await bcrypt.compare(password, user.password))){
                    // SESSION
                    context.session.username = user.username;
                    return user;

                }else {
                    // if user doesn't exist, return error
                    throw new GraphQLError('incorrect credentials')
                }
            } catch (err){
                throw new GraphQLError(`Error: ${err}`)
            }


        },
        async logout(_:any, {}, context:any) {
            context.session.destroy();
            console.log(`successfully logged out`);
        }
    },
    Query:{
        async user(_: any, {ID}: any) {
            return await User.findById(ID)
        }
    }
}