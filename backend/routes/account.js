const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User, Account } = require("../db/models/Models");
const { JWT_SECRET } = require("../config");

const authMiddleware = require("../middlewares/authMiddleware");
const { default: mongoose } = require("mongoose");

const accountRouter = express.Router();

// get balance
accountRouter.get("/balance", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(400).json({
        message: "username not fount in request",
      });
      return;
    }
    const account = await Account.findOne({ userId });
    res.status(200).json({
      message: "balance fetched",
      balance: account.balance,
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

// transfer funds
accountRouter.post("/transfer", authMiddleware, async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const userId = req.userId;
    if (!userId) {
      session.abortTransaction();
      res.status(400).json({
        message: "username not fount in request",
      });
      return;
    }

    const { to, amount } = req.body;

    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
      session.abortTransaction();
      res.status(400).json({
        message: "invalid to account",
      });
      return;
    }

    const fromAccount = await Account.findOne({ userId }).session(session);

    if (fromAccount.balance < amount) {
      session.abortTransaction();
      res.status(400).json({
        message: "insufficient funds",
      });
      return;
    }

    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    session.commitTransaction();

    res.status(200).json({
      message: "transfer successfull",
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

module.exports = accountRouter;
