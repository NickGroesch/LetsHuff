var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");
mongoose.connect("mongodb://localhost/letsHuff", {
  useNewUrlParser: true
});

module.exports = function(app) {
  app.get("/", (req, res) => {
    db.Article.find({}, null, { sort: { _id: -1 } }, (err, data) => {
      if (err) throw err;
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
      res.redirect("/");
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
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { note: dbNote._id } },
          { new: true }
        );
      })
      .then(x => {
        res.redirect(`/articles/${req.params.id}`);
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
