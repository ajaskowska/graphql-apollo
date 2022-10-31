export interface IBook {
    title: string;
    author: string;
    ID: string;
    description: string;
    rating: number;
}
export interface IBookInput extends IBook {
    bookInput: IBook;
}
export interface IBookFilters extends IBook {
    bookFilters: IBook;
}