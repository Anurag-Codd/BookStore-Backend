import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./database/db.js";

const PORT = process.env.PORT || 5555;

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));



app.listen(PORT,async()=>{
    await connectDB()
    console.log(`Book-Store Server running on Port ${PORT}`)
})