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
const sessionStore= new session.MemoryStore(); //Default memory store for session will leak.
const io          = require("socket.io")(http);
const cors        = require("cors");

const passportSocketIo = require('passport.socketio');
const DATABASE       = "mongodb+srv://gautham:brucewaynearkham@cluster0.baepu.mongodb.net/ggDB?retryWrites=true&w=majority";

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug')

//key: The name of the cookie - if left default (connect.sid),
// it can be detected and give away that an application is using Express as a web server.

//passport.socketio should have the same session-store as created here and same key (express.sid) as given here,
//since we are sharing our session with socketio.(passport-socketio should correctly get the same session that we created
//above from the same store.)
app.use(session({
  secret: "13",
  resave: true,
  saveUninitialized: true,
  key: 'express.sid',
  store: sessionStore,
}));

app.use(passport.initialize());
app.use(passport.session()); //the above created session is attached to passport. After login, user object attached to
//passport session.

mongo.connect(DATABASE, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
     if(err) return console.error(err);
     else {
       console.log("Successfully connected");
       var db = client.db("ggDB");

       auth(app, db);
       routes(app, db);

       http.listen(process.env.PORT || 3000);

       //sharing the session in passport with the socketio to check for authentication.(if logged in user object will be available
       //in the passport session that is shared to socketio).
       io.use(passportSocketIo.authorize({
          cookieParser: cookieParser,
          secret: '13',
          key: 'express.sid', // the name of the cookie where express stores its session_id.
          store: sessionStore //We use the key('express.sid') to the session store to get the session.
          //success: function-name,
          //fail: function-name
       }
     ));

       var currentUsers = 0;
       io.on('connection', (socket) => {
         ++currentUsers;
         console.log('user ' + socket.request.user.name + ' connected');
         io.emit('user', {name: socket.request.user.name, currentUsers, connected: true});

         socket.on('chat message', (message) => {
              io.emit('chat message', {name: socket.request.user.name, message});
         });

         socket.on('disconnect', () => {
             --currentUsers;
             io.emit('user', {name: socket.request.user.name, currentUsers, connected: false});
         });

       });
     }
});
