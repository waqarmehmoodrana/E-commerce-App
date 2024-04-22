import chatModel from '../models/chatModel.js'
import userModel from "../models/userModel.js";


// acess Chat 1 on 1
export const accessChat = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        console.log("UserId params not sent with the request");
        return res.sendStatus(400);
    }

    try {
        var isChat = await chatModel.find({
            isGroupChat: false,
            $and: [
                { usersArr: { $elemMatch: { $eq: req.user._id } } },
                { usersArr: { $elemMatch: { $eq: userId } } }
            ]
        }).populate('latestMessage');

        isChat = await userModel.populate(isChat, {
            path: 'latestMessage.sender',
            select: 'name email'
        })

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                usersArr: [req.user._id, userId],
            };

            const createdChat = await chatModel.create(chatData);
            const fullChat = await chatModel.findOne({ _id: createdChat._id }).populate('usersArr', '-password');
            res.status(200).send(fullChat);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Fetch Chats
export const fetchChats = async (req, res) => {
    try {
        chatModel.find({ usersArr: { $elemMatch: { $eq: req.user._id } } })
            .populate('usersArr', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await userModel.populate(results, {
                    path: 'latestMessage.sender',
                    select: 'name email'
                });

                res.status(200).send(results);
            });

    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Create Group Chat Controller
export const createGroupChat = async (req, res) => {

    if (!req.body.usersArr || !req.body.chatName) {
        return res.status(400).send({ message: "Please Fill All The Fields" });
    }

    var users = JSON.parse(req.body.usersArr);

    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group");
    }

    users.push(req.user);

    try {
        const groupChat = await chatModel.create({
            chatName: req.body.chatName,
            usersArr: users,
            isGroupChat: true,
            groupAdmin: req.user,
        })

        const fullGroupChat = await chatModel.findOne({ _id: groupChat._id })
            .populate("usersArr", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);

    }
};

// Rename Group 
export const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;


    const updatedChat = await chatModel.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new: true,
        }
    )
        .populate("usersArr", "-password")
        .populate("groupAdmin", "-password");
    if (!updatedChat) {
        res.status(400);
        throw new Error("Chat Not Found");
    } else {
        res.json(updatedChat);
    }
}

// Add to group
export const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await chatModel.findByIdAndUpdate(
        chatId, {
        $push: { usersArr: userId },
    },
        {
            new: true
        }
    ).populate("usersArr", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404);
        throw new Error("User Not Added");
    } else {
        res.json(added);
    }


}


// remove from  Group
export const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await chatModel.findByIdAndUpdate(
        chatId, {
        $pull: { usersArr: userId },
    },
        {
            new: true
        }
    ).populate("usersArr", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404);
        throw new Error("User Not Added");
    } else {
        res.json(removed);
    }


}