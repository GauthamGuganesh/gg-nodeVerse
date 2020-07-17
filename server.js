"use strict";

const express        = require("express");
const session        = require("express-session");
const passport       = require("passport");
const mongo          = require("mongodb").MongoClient;
const auth           = require("./auth.js");
const routes         = require("./routes.js");

const SESSION_SECRET = "13";
const DATABASE       = "mongodb+srv://gautham:brucewaynearkham@cluster0.baepu.mongodb.net/ggDB?retryWrites=true&w=majority";

const app = express();

app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');

app.use(session({
   secret: SESSION_SECRET,
   resave: true,
   saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongo.connect(DATABASE, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
     if(err) return console.error(err);
     else
     {
       console.log('Successfully connected');
       let db = client.db('ggDB');

       auth(app, db);
       routes(app, db);

       app.listen(process.env.PORT || 3000, () => {
         console.log("Listening on port 3000");
       });
     }
});
