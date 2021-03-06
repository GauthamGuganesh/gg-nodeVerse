const passport       = require("passport");
const bcrypt         = require("bcrypt");

const _dirname       = "/Users/gauthamguganesh/github/boilerplate-advancednode";
const filePath       = "pug/index";
const chatPath       = "pug/chat";
const profilePath    = "pug/profile";

module.exports = (app, db) => {

  app.route("/").get((req, res) => {
    res.render(filePath, {title: 'Hello', message: 'Please Login', showLogin: true, showRegistration: true});
  });

  app.route("/login").post(passport.authenticate('local', {failureRedirect: "/"}), (req, res) => {
     res.redirect("/chat");
  });

  app.route("/gitlogin").get(passport.authenticate('github')); //Delegating to github

  let ensureAuthenticated = (req, res, next) => {
     if(req.isAuthenticated()) return next();
     else res.redirect("/");
  }

  //authenticate using passport once again in callback to trigger the function in GitHub strategy.
  app.route("/auth/callback").get(passport.authenticate('github', {failureRedirect: "/"}), (req, res) => {
     res.redirect("/chat");
  })

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
     res.render(profilePath, {username: req.user.username});
  });

  app.route("/git-profile").get(ensureAuthenticated, (req, res) => {
     console.log(req.user);
     let gitprofile = {username: req.user.name, email: req.user.email,
                       id: req.user.id, photo: req.user.photo,
                       gitLogin: true};
     res.render(profilePath, gitprofile);
  });

  app.route("/register").post((req, res, next) => {
     db.collection('users').findOne({name: req.body.username}, (err, user) => {
       if(err) return console.error(err);
       else if(user) res.redirect("/");
       else
       {
         let hash = bcrypt.hashSync(req.body.password, 12);
         db.collection('users').insertOne({
             name: req.body.username,
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

   app.route('/chat').get(ensureAuthenticated, (req, res) => {
       console.log("Session obj : " + req.session);
       res.render(chatPath, {user: req.user});
  });

  app.route("/logout").get((req, res) => {
     req.logout(); //Logging out
     res.redirect("/");
  });
}
