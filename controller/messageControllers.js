import chatModel from '../models/chatModel.js'
import userModel from "../models/userModel.js";
import messageModel from '../models/messageModel.js';

export const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
        console.log("invalid data passed into Request!");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await messageModel.create(newMessage);

        message = await message.populate("sender", "name email");
        message = await message.populate("chat");
        message = await userModel.populate(message, {
            path: "chat.usersArr",
            select: "name email",
        });


        await chatModel.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400).send(error.message);
    }

}

// Controller function to fetch all  the messages
export const allMessages = async (req, res) => {
    try {
        const messages = await messageModel.find({ chat: req.params.chatId })
            .populate("sender", "name email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400).send(error.message);
    }
}