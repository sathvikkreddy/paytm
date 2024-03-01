const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(403).json({
        message: "not authorized",
      });
      return;
    }

    const authToken = authHeader.split(" ")[1];
    const { userId } = await jwt.verify(authToken, JWT_SECRET);
    if (!userId) {
      res.status(403).json({
        message: "not authorized",
      });
      return;
    }

    req.userId = userId;

    next();
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
