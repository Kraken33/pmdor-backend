import mongoose from 'mongoose';

export const createMongodbConnection = ()=>{
    mongoose.connect('mongodb://127.0.0.1:27017/pmdor').catch(console.error);
}