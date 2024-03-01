const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User, Account } = require("../db/models/Models");
const { JWT_SECRET } = require("../config");

const {
  signupValidation,
  signinValidation,
  updateUserValidation,
} = require("../middlewares/validationMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const userRouter = express.Router();

//sign up
userRouter.post("/signup", signupValidation, async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    //check if user already exist
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({
        message: "user already exists",
      });
      return;
    }

    //create hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create new user to db
    const user = { username, hashedPassword, firstName, lastName };
    const newUser = await User.create(user);

    if (!newUser) {
      res.status(400).json({
        message: "error while creating new user",
      });
      return;
    }

    //initialize the account for new user
    const userId = newUser._id;
    const balance = 1 + Math.random() * 10000;
    const newAccount = await Account.create({ userId, balance });

    if (!newAccount) {
      res.status(400).json({
        message: "error while initializing the new account",
      });
      return;
    }

    //sign jwt token
    const authToken = await jwt.sign({ userId }, JWT_SECRET);
    if (!authToken) {
      res.status(400).json({
        message: "error while generating auth token",
      });
    }

    res.status(200).json({
      message: "user created",
      authToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
    return;
  }
});

userRouter.post("/signin", signinValidation, async (req, res) => {
  try {
    const { username, password } = req.body;

    //check if user exist
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      res.status(400).json({
        message: "user doesnt exist",
      });
      return;
    }

    //create hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    //compare passwords
    if (!hashedPassword === existingUser.hashedPassword) {
      res.status(400).json({
        message: "invalid creds",
      });
      return;
    }

    const userId = existingUser._id;

    //sign jwt token
    const authToken = await jwt.sign({ userId }, JWT_SECRET);
    if (!authToken) {
      res.status(400).json({
        message: "error while generating auth token",
      });
    }

    res.status(200).json({
      message: "signed in",
      authToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
    return;
  }
});

//update user details

userRouter.put("/", authMiddleware, updateUserValidation, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(400).json({
        message: "user id not fount in request",
      });
      return;
    }

    const { password, firstName, lastName } = req.body;
    let updateBody = {};
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateBody = { ...updateBody, hashedPassword };
    }
    if (firstName) {
      updateBody = { ...updateBody, firstName };
    }
    if (lastName) {
      updateBody = { ...updateBody, lastName };
    }
    const updatedUser = await User.updateOne(
      { _id: userId },
      { $set: updateBody }
    );
    if (updatedUser.nModified === 0) {
      res.status(400).json({
        message: "updated failed in db",
      });
      return;
    }

    res.status(200).json({ message: "updated user" });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
    return;
  }
});

//filterable
userRouter.get("/bulk", authMiddleware, async (req, res) => {
  try {
    const { filter } = req.query;
    let users = await User.find({
      $or: [{ firstName: filter }, { lastName: filter }],
    });
    users = users.map((user) => {
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      };
    });
    res.status(200).json({
      message: "filtered",
      users,
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
    return;
  }
});

// userRouter.get("/", authMiddleware, async (req, res) => {
//   const userId = req.userId;
//   const user = await User.findById(userId);
//   console.log(userId);
//   console.log(user);
//   res.send("hi");
// });

module.exports = userRouter;
