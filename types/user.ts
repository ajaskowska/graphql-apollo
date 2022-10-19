export interface IUser {
    username: string;
    email: string;
    _id: string;
    ID: string;
    password: string;
}

export interface IUserInput extends IUser {
    registerInput: IUser;
    loginInput: IUser;
}