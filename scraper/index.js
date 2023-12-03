import logger from "./routes/common/logger.js";
import app from "./app.js";

process.on('uncaughtException', function (exception) {
  logger.error(exception);
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info("Express server started on port: " + port);
});
