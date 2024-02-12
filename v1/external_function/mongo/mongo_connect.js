import mongoose from "mongoose";
import { PORT, URI } from "../../config/config.js";

const connectionOptions = {}
mongoose.promise = global.Promise;
mongoose.set("strictQuery", false);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(URI, connectionOptions);
    console.log("Connected to database");
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
};

export { mongoose, connectToDatabase };
