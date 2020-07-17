
const passport       = require("passport");
const bcrypt         = require("bcrypt");
const ObjectID       = require("mongodb").ObjectID;
const LocalStrategy  = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github").Strategy;

const CLIENT_ID      = "6883bf625e7acc11401c";
const CLIENT_SECRET  = "969bb1b89a5980735298d219b1db915763fb36a5";
const CALLBACK       = "https://heroku-advanced-node.herokuapp.com/auth/callback";

module.exports = (app, db) => {

  passport.serializeUser((user, done) => {
    let id = {id: user._id, auth: user.auth};
    console.log(user);
    done(null, id);
  });

  passport.deserializeUser((id, done) => {
    db.collection('users').findOne({_id: new ObjectID(id.id)}, (err, user) => {
      if(err) return done(err);
      else done(null, user);
    })
  });

  //Strategy takes a function as argument
  passport.use(new LocalStrategy((username, password, done) => {
    db.collection('users').findOne({username: username}, (err, user) => {
      if(err) return done(err);
      else if(!user) return done(null, false);
      //comparing textual password and hash from the DB. (inside user.password)
      else if(!bcrypt.compareSync(password, user.password)) return done(null, false);
      else
      {
        user.auth = 'local';
        done(null, user);
      }
    });
  }));

  passport.use(new GitHubStrategy({
          clientID: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          callbackURL: CALLBACK
    },
       (accessToken, refreshToken, profile, done) => {
         console.log(profile);

       }
));
}
