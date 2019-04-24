var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");
mongoose.connect("mongodb://localhost/letsHuff", {
  useNewUrlParser: true
});

module.exports = function(app) {
  app.get("/", (req, res) => {
    db.Article.find({}, (err, data) => {
      if (err) throw err;
      //   console.log(data);

      //   res.json(data);
      res.render("home", { articles: data });
    });
  });

  app.get("/scrape", function(req, res) {
    axios.get("http://www.huffingtonpost.com/").then(function(response) {
      var $ = cheerio.load(response.data);

      $("div.card__headline__text").each(function(i, element) {
        var title = $(element).text();
        var link = $(element)
          .parent()
          .attr("href");
        var result = { title, link };
        db.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            console.log("Duplicates not permitted");
          });
      });
      res.send("Scrape Complete");
    });
  });

  app.get("/articles", function(req, res) {
    db.Article.find({}, (err, data) => {
      if (err) throw err;
      res.json(data);
    });
  });

  app.get("/articles/:id", function(req, res) {
    db.Article.findById(req.params.id)
      .populate("note")
      .then(data => {
        res.render("articleDetails", { article: data });
      });
  });

  app.post("/articles/:id", function(req, res) {
    console.log(req.body);

    db.Note.create(req.body)
      .then(function(dbNote) {
        // console.log(req.params.id);
        // console.log(dbNote);
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          //   to do, make notes a push instead of set
          { note: dbNote._id },
          { new: true }
        );
      })
      .then(x => {
        // console.log("x", x);
        res.json(x);
      })
      .catch(err => res.json(err));
  });
  // delete notes route
  app.post("/notes/:id", (req, res) => {
    db.Note.findByIdAndDelete({ _id: req.params.id }).then(data => {
      console.log(req.body);

      res.redirect("/"); //articles/" + req.body.article_id);
    });
  });
};