const express = require('express'),
app = express(),
parser = require('body-parser'),
mongoose = require('mongoose'),
methodOverride = require('method-override'),
expressSanitizer = require("express-sanitizer"),
locus = require("locus"),
PORT = process.env.PORT || 3000;

// Connection
const url = "mongodb+srv://luigi:luigi123@newsbunch-jn681.mongodb.net/newsdb?retryWrites=true&w=majority";

//App Config
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/images"));
app.use(parser.urlencoded({ extended: true }));
app.use(expressSanitizer());
mongoose.connect(url || 'mongodb://localhost/newsdb', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
app.use(methodOverride("_method"));

//Mongoose Config
const newsSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: String,
    created: { type: Date, default: Date.now }
});

var Article = module.exports = mongoose.model("Article", newsSchema);

//INDEX Route
app.get('/', function(req, res){
    res.redirect('/latestnews');
});

app.get('/latestnews', function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Article.find({title: regex}, function(err, articles){
            if(err){
                console.log(err);
            } else {
                if(articles.length < 1) {
                    noMatch = "Article not found ! Would you like to try something else ?"
                }
                res.render("index", {articles: articles, noMatch: noMatch});
            };
        })
    } else {
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        } else {
            res.render("index", {articles: articles, noMatch: noMatch});
        }
    });
}
});

app.get("/about", function(req, res){
    res.render("about");
});

//NEW Route
app.get('/new', function(req, res){
    res.render("new");
});

//CREATE Route
app.post('/latestnews', function (req, res){
req.body.article.body = req.sanitize(req.body.article.body);
Article.create(req.body.article, function (err, newArticle){
if (err){
    res.render("new");
} else {
    res.redirect("/latestnews");
}});
});

//SHOW Route
app.get('/latestnews/:id', function (req, res){
    Article.findById(req.params.id, function (err, foundArticle){
        if (err){
            res.redirect("/latestnews");
        } else {
            res.render("show", {article: foundArticle});
        }});
});

//EDIT Route
app.get('/latestnews/:id/edit', function (req, res){
    Article.findById(req.params.id, function(err, foundArticle){
        if (err){
            res.render("/latestnews");
        } else {
            res.render("edit", {article: foundArticle});
        }});

});

//UPDATE Route
app.put('/latestnews/:id', function (req, res){
  req.body.article.body = req.sanitize(req.body.article.body);
Article.findByIdAndUpdate(req.params.id, req.body.article, function (err, updatedArticle){
     if(err){
         res.redirect("/latestnews");
     } else {
         res.redirect("/latestnews/" + req.params.id);
     }});
});

//DELETE Route
app.delete("/latestnews/:id", function (req, res){
    Article.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/latestnews");
        } else {
              res.redirect("/latestnews");
        }});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]+/g, "\\$&");
};

app.listen(PORT, () => {
    console.log(`Server running pn port: ${ PORT } ...`);
});
