
const passport       = require("passport");
const bcrypt         = require("bcrypt");
const ObjectID       = require("mongodb").ObjectID;
const LocalStrategy  = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github").Strategy;

const CLIENT_ID      = "6883bf625e7acc11401c";
const CLIENT_SECRET  = "969bb1b89a5980735298d219b1db915763fb36a5";
const CALLBACK       = "https://heroku-advanced-node.herokuapp.com/auth/callback";

module.exports = (app, db) => {

  passport.serializeUser((obj, done) => {
    let id = undefined;

    if(obj.auth === 'local') id = {id: obj._id, auth: obj.auth};
    else if(obj.auth === 'github') id = {id: obj.id, auth: obj.auth};

    done(null, id);
  });

  passport.deserializeUser((id, done) => {
    switch(id.auth)
    {
      case 'local':
                  db.collection('users').findOne({_id: new ObjectID(id.id)}, (err, user) => {
                    if(err) return done(err);
                    else done(null, user);
                  });

      case 'github':
                  db.collection('socialusers').findOne({id: id.id}, (err, user) => {
                    if(err) return done(err);
                    else done(null, user);
                  });
      default:
            console.log("-Auth method not available yet-");
    }
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

       db.collection('socialusers').findOneAndUpdate({id: profile.id},
          { $setOnInsert: { id: profile.id,
                            name: profile.displayName,
                            url: profile.profileURL,
                            email: profile.emails[0].value,
                            photo: profile.photos[0].value,
                            provider: profile.provider },
            $set: { last_login: new Date() },
            $inc: { login_count: 1 }
          },
          {upsert: true, returnOriginal: false},
          (err, user) => {
              if(err) return console.error(err);

              console.log(user);
              user.auth = 'github';
              return done(null, user);
          });
       }
));
}
