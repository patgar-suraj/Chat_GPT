const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

// routes
const authRouter = require("./router/auth.route")
const chatRouter = require("./router/chat.route")

const app = express()

// using middlewares
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// using routes
app.use("/api/auth", authRouter)
app.use("/api/chat", chatRouter)

module.exports = app