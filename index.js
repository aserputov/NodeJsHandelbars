var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
const app = express();
var path = require("path");
var multer = require("multer");
var nodemailer = require("nodemailer");
var mongoose = require("mongoose");
const clientSessions = require("client-sessions");
const config = require("./js/config");
var UsrModel = require("./models/userModel");
const bnbModel = require("./models/bnbModel");
const { response } = require("express");
const connectionString = config.dbconn;

mongoose.Promise = require("bluebird");

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true 
});

mongoose.connection.on("open", () => {
  console.log("Database connection open.");
});

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

//create storage properties
const STORAGE = multer.diskStorage({
  destination: "./public/photos/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const UPLOAD = multer({ storage: STORAGE });

// email setup

app.engine(".hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", ".hbs");

app.get("/", function (req, res) {
  res.render("index.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});
app.get("/reg", function (req, res) {
  res.render("reg.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});
app.get("/booknow", function (req, res) {
  res.render("booknow.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});
app.get("/error", function (req, res) {
  res.render("error.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});
app.get("/listings", function (req, res) {
  res.render("listings.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});
app.get("/roomdetails", function (req, res) {
  res.render("roomdetails.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});
app.get("/searchres", function (req, res) {
  res.render("searchres.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});
app.get("/searchres", function (req, res) {
  res.render("searchres.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});
app.get("/dashboard", function (req, res) {
  res.render("dashboard.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});
app.get("/location", function (req, res) {
  res.render("location.hbs", {
    layout: false, // do not use the default Layout (main.hbs)
  });
});

// call function after http server starts listening for requests

app.use(express.static("views"));
app.use(express.static("public"));

// setup a 'route' to listen for the root folder   http://localhost:PORT

app.use(clientSessions({
  cookieName: "session",
  secret: "web322_week10_demoSession",
  duration: 2*60*1000,
  activeDuration: 1000*60
}));

app.use(bodyParser.urlencoded({extended: false }));

/* #endregion */

/* #region SECURITY */
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};
/* #endregion */

/* #region ROUTES */
app.get("/", function(req,res){
  res.render('home',{user: req.session.user, layout: false});
  });

  /* #region LOGIN LOGOUT */
app.get("/login", (req,res)=>{
      //req.session.destroy(null);
      res.render("login", {layout: false});
  });

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
      return res.render("login", {errorMsg: "Missing Credentials.", layout: false});
  }

  UsrModel.findOne({username: username})
      .exec()
      .then((usr) => {
          if (!usr) {
              res.render("login", {errorMsg: "login does not exist!", layout: false});
          } else {
              // user exists
              
              if (username === usr.username && password === usr.password){
                  req.session.user = {
                      username: usr.username,
                      email: usr.email,
                      firstName: usr.firstName,
                      lastName: usr.lastName,
                      isAdmin: usr.isAdmin
                  };
                  res.render("dashboard", {usr: req.session.user, layout: false});
              } else {
                  res.render("login", {errorMsg: "login and password does not match!", layout: false});
              };
          };

          
      })
      .catch((err) => { console.log("An error occurred: ${err}")});
});




app.get("/logout", (req,res)=> {
  req.session.reset();
  res.render("login", {errorMsg: "invalid username or password!", layout: false});
});
/* #endregion */

  /* #region PROFILES */
app.get("/Profile", ensureLogin, (req,res)=>{
 res.render("Profile", {user: req.session.user, layout: false});
});

app.get("/Profile/Edit", ensureLogin, (req,res)=>{
  res.render("ProfileEdit", {user: req.session.user, layout: false});
});

app.post("/Profile/Edit", ensureLogin, (req,res) => {
  const username = req.body.username;
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const Email = req.body.email;
  const isAdmin = (req.body.isAdmin === "on");
  UsrModel.updateOne(
      { username: username },
      {$set: {
          firstName: firstName,
          lastName: lastName,
          email: Email,
          isAdmin: true
      }}
  ).exec()
  .then(()=>{
      req.session.user = {
          username: username,
          email: Email,
          firstName: firstName,
          lastName: lastName,
          isAdmin: isAdmin
      };
      res.redirect("/Profile");
  });
/*    .then((err) => {
      if (err) {
          console.log("An error occurred while updating the profile: " + err);
      } else {
          console.log("Profile " + req.body.username + " updated successfully");
      }
  })
  .catch((err) => {
      console.log("ERROR: " + err);
  });
*/
  
});

/* #endregion */

app.get("/dashboard", ensureLogin, (req,res) => {
  res.render("dashboard", {user: req.session.user, layout: false});
});

/* #region bnbs */ 
app.get("/bnb", ensureLogin, (req,res) => {
  bnbModel.find()
      .lean()
      .exec()
      .then((bnb) =>{
          res.render("bnb", {bnb: bnb, hasBnbs: !!bnb.length, user: req.session.user, layout: false});
      });
})

app.get("/Bnb/Edit", ensureLogin, (req,res) => {
  res.render("bnbEdit", {user: req.session.user, layout: false});
})

app.get("/bnb/Edit/:bnbid", ensureLogin, (req,res) => {
  const bnbid = req.params.bnbid;

  bnbModel.findOne({_id: bnbid})
      .lean()
      .exec()
      .then((bnb)=>{
          res.render("bnbEdit", {user: req.session.user, bnb: bnb, editmode: true, layout: false})
      .catch(()=>{});
  });
});

app.get("/Bnb/Delete/:bnbid", ensureLogin, (req, res) => {
  const bnbid = req.params.bnbid;
  bnbModel.deleteOne({_id: bnbid})
      .then(()=>{
          res.redirect("/bnb");
      });
})

app.post("/Bnb/Edit", ensureLogin, (req,res) => {
  const bnb = new bnbModel({
      _id: req.body.ID,
      year: req.body.year,
      make: req.body.make,
      model: req.body.model,
      VIN: req.body.VIN,
      colour: req.body.colour
  });

  if (req.body.edit === "1") {
      // editing
      bnbModel.updateOne({_id: bnb._id},
          { $set: {
              year: bnb.year,
              make: bnb.make,
              model: bnb.model,
              VIN: bnb.VIN,
              colour: bnb.colour
          }}
          ).exec().then((err)=>{});
         
       //bnb.updateOne((err)=>{});

  } else { 
      //adding
      bnb.save((err)=>{});
  };

  res.redirect("/bnb");

});
/* #endregion */

app.get("/firstrunsetup", (req,res)=> {
  var Clint = new UserModel({
      username: 'clint',
      password: 'mypassword',
      firstName: 'Clint',
      lastName: 'MacDonald',
      email: 'clint.macdonald@senecacollege.ca',
      isAdmin: true
  });
  console.log("got here!");
  Clint.save((err)=> {
      console.log("Error: " + err + ';');
      if (err) {
          console.log("There was an error creating Clint: " + err);
      } else {
          console.log("Clint was created");
      }
  });
  console.log("got here 2!");
  res.redirect("/");
})






app.post("/dashboard", UPLOAD.single("photo"), (req, res) => {
  const new_user = req.body;
  const FORM_FILE = req.file;

  var user = new UsrModel({
    username: new_user.email,
    firstName: new_user.fname,
    lastName: new_user.lname,
    email: new_user.email,
    password: new_user.password,
  });
  user
    .save()
    .then((response) => {
      console.log(response);
      console.log("I am here");
    })
    .catch((err) => {
      console.log(err);
    });


  res.render("dashboard.hbs", {
    data: new_user,
    layout: false, // do not use the default Layout (main.hbs)
  });
});

// setup http server to listen opn the port designated above
app.listen(HTTP_PORT, onHttpStart);
