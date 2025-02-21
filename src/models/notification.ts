import mongoose, { Schema ,model} from "mongoose";
export const notificationSchema = new Schema(
  {
    id: { type: Number, unique: true },

    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    urgency:{
      type: String,
      required: true, 
    },
    sendTo: {
      type: String,
      enum: ["All", "Selected"],
      required: true,
    },
    users: [{
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true // Make the user reference required
      },
      status: {
        type: String, 
        default: "Pending", 
        enum: ["Success", "Pending", "Fail"] 
      },
    }],
    isDeleted: { type: Boolean, default: false },
    status: { type: String, enum: ["Success", "Pending", "Fail"] },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "notification" }
);
notificationSchema.pre("save", async function (next) {
  if (!this.id) {
    // Get the count of documents in the collection
    const count = await model("notification").countDocuments();
    this.id = count + 1; // Set the ID as the count + 1
  }
  next();
});