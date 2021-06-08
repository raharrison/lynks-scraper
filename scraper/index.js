const logger = require("./routes/common/logger");
const app = require("./app");

process.on('uncaughtException', function (exception) {
  logger.error(exception);
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info("Express server started on port: " + port);
});
