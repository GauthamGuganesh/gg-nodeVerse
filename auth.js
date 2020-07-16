
const passport       = require("passport");
const bcrypt         = require("bcrypt");
const ObjectID       = require("mongodb").ObjectID;
const LocalStrategy  = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github").Strategy;

const CLIENT_ID      = "";
const CLIENT_SECRET  = "";
const CALLBACK       = "";

module.exports = (app, db) => {

  passport.serializeUser((user, done) => {
    let id = {id: user._id, auth: user.auth};
    done(null, id);
  });

  passport.deserializeUser((id, done) => {
    console.log(id);
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
}
