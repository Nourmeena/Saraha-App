import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 20000,
      required: function () {
        return this.attachments?.length ? false : true;
      },
    },
    attachments: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
    },
  },
  {
    timeStamps: true,
  },
);

export const MessageModel = mongoose.models.Message || mongoose.model("Message", messageSchema)
//It ensures that Mongoose doesn't try to redefine a model that already exists

