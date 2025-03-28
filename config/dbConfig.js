import mongoose from "mongoose";

export default async () => {
    try {
        const URL = process.env.DATABASE_URI;
        mongoose.connect(URL);

        const db = mongoose.connection;

        db.on("open", ()=> {
            console.log("Connected to database.");
        });

        db.on("error", (err)=> {
            console.error("MongoDB: Error", err);
            process.exit(1);
        });

        mongoose.Promise = global.Promise;
        
    } catch (error) {
        console.error("MongoDB: Error", error);
        process.exit(1);
    };
};