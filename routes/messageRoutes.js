import  express from 'express';
import {
    allMessages,
    sendMessage,

} from '../controller/messageControllers.js';

import  { requireSignIn } from '../middlewares/authMiddleware.js';
const router = express.Router();

// Route to send the message 
router.post('/send-message', requireSignIn, sendMessage);


//Route to Fetch All the messages 
router.get('/all-messages/:chatId', requireSignIn,allMessages);


export default router;