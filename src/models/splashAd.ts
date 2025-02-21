import mongoose, { Schema,model } from "mongoose";
export const splashAdSchema = new Schema(
  {
    id: { type: Number, unique: true },

    image: {
      type: String,
      required: true,
    },
    hyperLink: {
      type: String,
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "InActive"], // Correctly defined enum values
      required: true, // Optional: enforce that status must be provided
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "splashAd" }
);
splashAdSchema.pre("save", async function (next) {
  if (!this.id) {
    // Get the count of documents in the collection
    const count = await model("splashAd").countDocuments();
    this.id = count + 1; // Set the ID as the count + 1
  }
  next();
});