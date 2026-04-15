import mongoose from "mongoose";
const tokenSchema = new mongoose.Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  expiresIn: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
}, {
    timeStamps:true
});

export const TokenModel = mongoose.models.Token || mongoose.model("Token", tokenSchema)
//It ensures that Mongoose doesn't try to redefine a model that already exists
TokenModel.syncIndexes()
