var express = require("express");
var logger = require("morgan");
var expressHb = require("express-handlebars");
var PORT = 3000;
var mongoose = require("mongoose");

var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.engine("handlebars", expressHb({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var databaseURI = "mongodb://localhost/letsHuff";
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseURI);
}
var db = mongoose.connection;
db.on("error", err => console.log("mongoose error :", err));
db.once("open", () => console.log("mongoose connection successful"));

require("./controller/controller")(app);

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
