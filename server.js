var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var handlebars = require('express-handlebars')


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8081;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/week18hw";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Setup handlebars
app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars({
    extname: 'handlebars',
    defaultView: 'default',
    layoutsDir: __dirname + '/views/pages/',
    partialsDir: __dirname + '/views/partials/'
}))

// Routes


// A GET route for scraping the huffington post website
app.get("/scrape", function (req, res) {
    console.log('/scrape');
    // First, we grab the body of the html with axios
    axios.get("http://huffpost.com/").then(function (response) {
        // // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        var results = [];

        // Now, we grab every h2 within an article tag, and do the following:
        console.log($(".card .card--media"));
        $(".card.card--media-left").each(function (i, element) {
            console.log(i)
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .find(".card__headline__text")
                .text()
                .replace(/\r?\n|\r/g, '');
            result.description = $(this)
                .find(".card__link")
                .text()
                .replace(/\r?\n|\r/g, '');
            result.link = $(this)
                .find(".card__link")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });

            results.push(result);
        });

        // Send a message to the client
        res.send(results);
    }).catch(err => {
        console.log('error: ', err);
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/articles/saved", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({ saved: true })
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.post("/articles/save/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id }, function (err, article) {
        article.saved = !article.saved;
        article.save();
    })
    res.send('success')
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.delete("/articles", function (req, res) {
    db.Article.remove({}, function (response) {
        res.send('success')
    })
})

app.get('/', function (req, res) {
    res.render('home', { layout: 'default', template: 'home-template' });
})

app.get('/saved', function (req, res) {
    res.render('saved', { layout: 'default', template: 'saved-template' });
})


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
