var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
var path = require("path");
var multer = require("multer");
var nodemailer = require("nodemailer");

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}


//create storage properties
const STORAGE = multer.diskStorage({
    destination: "./public/photos/",
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const UPLOAD = multer({ storage: STORAGE});

// email setup
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: 'northcapitalca@gmail.com',  //your email account
        pass: 'Se25pu08to20v?'  // your password
    }
});

app.engine(".hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", ".hbs");

app.get("/", function(req,res){
    res.render('index.hbs', {
        layout: false // do not use the default Layout (main.hbs)
    });
});
app.get("/reg", function(req,res){
   
    res.render('reg.hbs', {
        layout: false // do not use the default Layout (main.hbs)
    });
});
app.get("/booknow", function(req,res){
    res.render('booknow.hbs', {
        layout: false // do not use the default Layout (main.hbs)
    });
});
app.get("/error", function(req,res){
   
    res.render('error.hbs', {
        layout: false // do not use the default Layout (main.hbs)
    });
});
app.get("/listings", function(req,res){
    res.render('listings.hbs', {
        layout: false // do not use the default Layout (main.hbs)
    });
});
app.get("/roomdetails", function(req,res){
   
    res.render('roomdetails.hbs', {
        layout: false // do not use the default Layout (main.hbs)
    });
});
app.get("/searchres", function(req,res){
   
    res.render('searchres.hbs', {
        layout: false // do not use the default Layout (main.hbs)
    });
});
app.get("/searchres", function(req,res){
   
    res.render('searchres.hbs', {
        layout: false // do not use the default Layout (main.hbs)
    });
});



// call function after http server starts listening for requests


app.use(express.static("views"));
app.use(express.static("public"));


// setup a 'route' to listen for the root folder   http://localhost:PORT

app.post("/dashboard", UPLOAD.single("photo"), (req, res) => {
    const new_user = req.body;
    const FORM_FILE = req.file;

    const DATA_RECEIVED = "Your submission was received: <br/><br/>" +
        "Your form data was:<br/>" + JSON.stringify(new_user) + "<br/><br/>" +
        "<br/><br/>Welcome <strong>" + new_user.fname + " " + new_user.lname + "</strong>" +
        " to the world .";

    var mailOptions = {
        from: '',
        to: new_user.email,
        subject: 'Eguana-to prepare your trip.Welcome,'+new_user.fname+new_user.lname,
        html: '<p>Hello ' + new_user.fname + ":</p><p>Thank-you for contacting us.</p>",
        
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("ERROR: " + error);
        } else {
            console.log("SUCCESS: " + info.response);
        }
    });

    res.render('dashboard.hbs', {
        data: new_user,
        layout: false // do not use the default Layout (main.hbs)
    });
});








// setup http server to listen opn the port designated above
app.listen(HTTP_PORT, onHttpStart);