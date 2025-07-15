import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        // Set default MongoDB URI if not provided
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vlogg';
        
        // Configure mongoose options for newer versions
        const options = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
        };

        await mongoose.connect(mongoURI, options);
        console.log("MongoDB Connected Successfully");
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
    } catch(err) {
        console.error('Database connection failed:', err.message);
        console.log('Please make sure MongoDB is running and accessible');
        console.log('You can start MongoDB locally or provide a valid MONGO_URI in your .env file');
        process.exit(1);
    }
};

export default connectDB;