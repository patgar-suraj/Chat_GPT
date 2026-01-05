const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../model/users.model");
const aiServise = require("../services/ai.service")
const messageModel = require("../model/message.model")

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      next(new Error("authentication faild: valid token required"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id);

      socket.user = user;
      next();

    } catch (error) {
      next(new Error("authentication faild: valid token required"));
    }
  });

  io.on("connection", (socket) => {
    
    socket.on("ai-message", async(msgPayload)=>{
        await messageModel.create({
            chat: msgPayload.chat,
            user: socket.user._id,
            content: msgPayload.content,
            role: "user"
        })

        const chatHistroy = await messageModel.find({
            chat: msgPayload.chat
        })

        const response = await aiServise.generateResponse(chatHistroy.map((item)=>{
            return {
                role: item.role,
                parts: [{text: item.content}]
            }
        }))

        await messageModel.create({
            chat: msgPayload.chat,
            user: socket.user._id,
            content: response,
            role: "model"
        })

        socket.emit("ai-response", {
            content: response,
            chat: msgPayload.chat
        })
    })
  });
}

module.exports = initSocketServer;
