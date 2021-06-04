const app = require("./app");

process.on('uncaughtException', function (exception) {
  console.log(exception);
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log("Express server started on port: " + port);
});
