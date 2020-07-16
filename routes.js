const passport       = require("passport");
const bcrypt         = require("bcrypt");

const _dirname       = "/Users/gauthamguganesh/github/boilerplate-advancednode";
const filePath       = _dirname + "/views/pug/index";
const profilePath    = _dirname + "/views/pug/profile";

module.exports = (app, db) => {

  app.route("/").get((req, res) => {
    res.render(filePath, {title: 'Hello', message: 'Please Login', showLogin: true, showRegistration: true});
  });

  app.route("/login").post(passport.authenticate('local', {failureRedirect: "/"}), (req, res) => {
     res.redirect("/profile");
  });

  let ensureAuthenticated = (req, res, next) => {
     if(req.isAuthenticated()) return next();
     else res.redirect("/");
  }

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
     res.render(profilePath, {username: req.user.username});
  });

  app.route("/register").post((req, res, next) => {
     db.collection('users').findOne({username: req.body.username}, (err, user) => {
       if(err) return console.error(err);
       else if(user) res.redirect("/");
       else
       {
         let hash = bcrypt.hashSync(req.body.password, 12);
         db.collection('users').insertOne({
             username: req.body.username,
             password: hash
           }, (err, user) => {
               if(err) return console.error(err);
               return next();
           });
       }
     });
  }, passport.authenticate('local', {failureRedirect: "/"})
   , (req, res) => {
       res.redirect("/profile");
   });

  app.route("/logout").get((req, res) => {
     req.logout(); //Logging out
     res.redirect("/");
  });
}
