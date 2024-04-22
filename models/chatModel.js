import mongoose from "mongoose";

const chatModel = mongoose.Schema(
    {
        chatName: { type: String, trim: true },
        isGroupChat: { type: Boolean, default: false },
        usersArr: [{
            type: mongoose.ObjectId,
            ref: "users"
        }],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
    },
    { timestamps: true }
);

export default mongoose.model("Chat", chatModel);
