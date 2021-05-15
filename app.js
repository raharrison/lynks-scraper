const express = require("express");
const baseRouter = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api", baseRouter);

app.use((err, req, res, next) => {
  console.error(err.stack)
  return res.status(500).json({
    error: err.message,
  });
});

module.exports = app;
