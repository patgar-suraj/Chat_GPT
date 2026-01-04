const userModel = require("../model/users.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

async function registerUser(req, res){
    const {fullname: {firstname, lastname}, email, password} = req.body

    const isUserAlreadyExist = await userModel.findOne({email})

    if(isUserAlreadyExist){
        res.status(400).json({
            message: "user already exist"
        })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        fullname: {
            firstname, lastname
        },
        email,
        password: hashPassword
    })

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

    const cookie = ("token", token)

    res.status(201).json({
        message: "user registerd successfully",
        user: {
            email: user.email,
            id: user._id,
            fullname: user.fullname,
        }
    })
}

async function loginUser(req, res){
    const {email, password} = req.body

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message: "invalid username or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        return res.ststus(400).josn({
            message: "invalid username or password"
        })
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

    const cookie = ("token", token)

    res.status(201).json({
        message: "user loggedin successfully",
        user: {
            email: user.email,
            id: user._id,
            fullname: user.fullname,
        }
    })
}

module.exports = {
    registerUser,
    loginUser
}