import mongoose, { Schema,model} from "mongoose";
export const FaQListSchema = new Schema(
  {
    id: { type: Number, unique: true },

    title: {
      type: String,
      required: true,
    },
    description:{
      type: String,
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaQTopics",
      required: true,
    },
    priority: {
      type: String,
      required: true,
      unique: true,
    },

    status: { type: String, enum: ["Active", "InActive"] },

    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "FaQList" }
);
FaQListSchema.pre("save", async function (next) {
  if (!this.id) {
    // Get the count of documents in the collection
    const count = await model("FaQList").countDocuments();
    this.id = count + 1; // Set the ID as the count + 1
  }
  next();
});