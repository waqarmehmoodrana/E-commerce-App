import express from "express";
import formidable from "express-formidable";
import {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
} from '../controller/chatControllers.js';
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/accesschat', requireSignIn, accessChat);
router.get('/fetchchats', requireSignIn, fetchChats);
router.post('/create-gorup-chat', requireSignIn, createGroupChat);
router.put('/rename-group',requireSignIn, renameGroup);
router.put('/add-to-group',requireSignIn, addToGroup);
router.put('/remove-from-group',requireSignIn, removeFromGroup);

export default router;