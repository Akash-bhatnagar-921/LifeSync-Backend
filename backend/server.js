import cors from "cors";
import mongoose from "mongoose";
import express from "express";
import  dotenv  from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import moodRoutes from "./routes/moodRoute.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3060;

// Middleware
app.use(express.json());
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));

app.use('/api/auth',authRoutes)
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWMxMDkyOTQ4N2QyM2QzYzZhOTdiNiIsImlhdCI6MTc1MTMwNTI5MCwiZXhwIjoxNzUxMzkxNjkwfQ.O3dQn7g7t54qxCX3cHD-I-xvIIDQAsufQZtkddm95Hs
app.use('/api/user',userRoutes)
app.use("/api/mood", moodRoutes);
app.use("/api/journal",journalRoutes)

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
