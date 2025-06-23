import cors from "cors";
import mongoose from "mongoose";
import express from "express";
import  dotenv  from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3060;

// Middleware
app.use(express.json());
app.use(cors());

app.use('/api/auth',authRoutes)
app.use('/api/user',userRoutes)

app.get("/healthCheck", (req, res) => {
  res.send("LifeSync API is live 🚀");
});

// connectDB().then(()=> {
//     app.listen(PORT,()=>{
//         console.log(`Server is running on localhost:${PORT}`)
//     })
// })

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on localhost:${PORT}`);
    });
  } catch (e) {
    console.log(e);
    process.exit(1)
  }
};

startServer();
