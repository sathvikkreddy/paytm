const express = require("express");
const cors = require("cors");

const connectToDb = require("./db/conncetDb");
const rootRouter = require("./routes/index");

const app = express();

// //middlewares
app.use(express.json());
app.use(cors());
app.use("/api/v1/", rootRouter);

//
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});

connectToDb();
