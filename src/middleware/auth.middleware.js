const userModel = require("../model/users.model");
const jwt = require("jsonwebtoken");

async function authUser(req, res, next) {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({
      message: "unothorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id );

    req.user = user;
    next();
    
  } catch (error) {
    res.status(401).json({
      message: "unothorized",
    });
  }
}

module.exports = {
  authUser,
};
