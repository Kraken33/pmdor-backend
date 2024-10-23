import mongoose from 'mongoose';

export const createMongodbConnection = async ()=>{
    try {
        await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.ezkoy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/pmdoro`);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } catch(e) {
        await mongoose.disconnect();
      }
}