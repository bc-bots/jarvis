import mongoose from "mongoose";
import { logger } from "./utils/logger.js";

export const traitSchema = new mongoose.Schema({
  _id: String, // userId
  name: String,
  trait_summary: String,
});

export const Trait = mongoose.model("Trait", traitSchema);

export function connectToDatabase() {
  mongoose.connect(process.env.MONGO_URI).catch((err) => {
    logger.err("MongoDB connection failed:", err.message);
    process.exit(1);
  });
}
