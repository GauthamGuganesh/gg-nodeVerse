const express     = require('express');
const session     = require('express-session');
const bodyParser  = require('body-parser');
const auth        = require('./auth.js');
const routes      = require('./routes.js');
const mongo       = require('mongodb').MongoClient;
const passport    = require('passport');
const cookieParser= require('cookie-parser')
const app         = express();
const http        = require('http').Server(app);
const sessionStore= new session.MemoryStore();
const io          = require("socket.io")(http);

const DATABASE       = "mongodb+srv://gautham:brucewaynearkham@cluster0.baepu.mongodb.net/ggDB?retryWrites=true&w=majority";

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug')

app.use(session({
  secret: "13",
  resave: true,
  saveUninitialized: true,
  key: 'express.sid',
  store: sessionStore,
}));

mongo.connect(DATABASE, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
     if(err) return console.error(err);
     else {
       console.log("Successfully connected");
       var db = client.db("ggDB");

       auth(app, db);
       routes(app, db);

       http.listen(process.env.PORT || 3000);

       io.on('connection', (socket) => {
         console.log('Connected');
       })

     }
});
