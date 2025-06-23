import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Mongo DB Connected at ${conn.connection.host}`)
  } catch (error) {
    console.log(`Mongo DB Connection Error: ${error.message}`)
        throw error;
  }
};

export default connectDB;
