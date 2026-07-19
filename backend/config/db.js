const mongoose = require("mongoose");

// Default to JSON mode to prevent race conditions during boot
global.dbMode = 'json';

const connectDB = async()=>{
    try{
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 3000 // 3 seconds timeout
        });
        console.log("MongoDB Connected to Atlas successfully");
        global.dbMode = 'atlas';
    }
    catch(error){
         console.error("MongoDB Atlas Connection Error Details:", error);
         console.warn("Failed to connect to MongoDB Atlas. Trying local MongoDB fallback...");
         try {
             await mongoose.connect("mongodb://localhost:27017/hackteam", {
                 serverSelectionTimeoutMS: 2000 // 2 seconds timeout
             });
             console.log("MongoDB Connected to Local instance successfully");
             global.dbMode = 'local';
         } catch (localError) {
             console.error("MongoDB Connection Error (both Atlas and Local failed):", localError.message);
             console.warn("--- WARNING: MongoDB failed to connect. Running in local JSON-file fallback mode. ---");
             global.dbMode = 'json';
         }
    }
};
module.exports = connectDB;