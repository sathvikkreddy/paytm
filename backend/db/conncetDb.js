const mongoose = require("mongoose");

const uri =
  "mongodb+srv://sathvikreddy8685:sathvik8685@cluster0.mjiyh5g.mongodb.net/paytm?retryWrites=true&w=majority&appName=Cluster0";

const connectDb = () => {
  mongoose.connect(uri).then(() => {
    console.log("connected to db");
  });
};

module.exports = connectDb;
