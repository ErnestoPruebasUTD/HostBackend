import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI as string;

const connectDB = async():Promise<void> => {
    try {
        await mongoose.connect(mongoUri);
        console.log("Conexión a mongo")
    }
    catch (error) {
        console.log("Error de conexión : ", error)
    }
};

export default connectDB;