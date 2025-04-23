import mongoose from "mongoose";

export const traitSchema = new mongoose.Schema({
  _id: String, // userId
  name: String,
  trait_summary: String,
});

export const Trait = mongoose.model("Trait", traitSchema);

export function connectToDatabase() {
  mongoose.connect(process.env.MONGO_URI).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit the process if the database connection fails
  });
}
