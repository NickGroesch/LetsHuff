var express = require("express");
var logger = require("morgan");
var expressHb = require("express-handlebars");
var PORT = 3000;

var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.engine("handlebars", expressHb({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

require("./controller/controller")(app);

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
