import express from "express"
import colors from "colors"
import dotenv from "dotenv"
import morgan from "morgan";
import connectDB from "./config/db.js";
import { Server } from 'socket.io';
import authRoutes from "./routes/authRoute.js"
import categroyRoutes from './routes/categoryRoute.js'
import productRoutes from './routes/productRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import messageRoutes from "./routes/messageRoutes.js";
import { Routes } from 'react-router-dom';
import path from 'path';

import cors from 'cors'

//configuer dotenv
dotenv.config();

// Database Config
connectDB();

// REST Object 
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/category', categroyRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);

// --------------------------Deployment------------------------

const __dirname1 = path.resolve();

if(process.env.NODE_ENV  === 'production'){
    app.use(express.static(path.join(__dirname1, "/client/build")));
    
    app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
    );
}
else{
    app.get("/", (req, res) => {
        res.send("API is running..");
    });
}

// --------------------------Deployment------------------------


// rest api 
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Aviary</h1>')
})


// port 
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log(`Server running on ${process.env.DEV_MODE} node on port ${PORT}`.bgCyan.white);
});

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
        // credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on('setup', (userD) => {
        socket.join(userD._id);
        console.log(userD._id);
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User Joined  Room:' + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));

    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        // console.log(newMessageRecieved);
        var chat = newMessageRecieved.chat;

        if (!chat.usersArr) return console.log("chat.usersArr not defined");

        chat.usersArr.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) {
                return;
            }

            //console.log("user: ", user._id);
            //console.log("sender ID: ", newMessageRecieved.sender._id);

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });

        //console.log("new message socket works");

    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userD._id);
    });

});
