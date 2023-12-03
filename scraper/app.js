import express from "express";

import baseRouter from "./routes/index.js";

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

export default app;
