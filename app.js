const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const http = require('http');
const fetch2 = require("isomorphic-fetch");
const validator = require('validator');
const session = require('express-session')
const FileStore = require('session-file-store')(session);
const User = require('./models/user')
const app = express()

app.set('view engine', 'ejs');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(session({
    secret : 'web2-projekt2',
    resave : false,
    store : new FileStore(),
    saveUninitialized : true,
    cookie: {httpOnly: false, maxAge : 24 * 60 * 100 * 1000}
}));

const uri = 'mongodb+srv://dk51636:Password123!@moviecluster3.tuzcz.mongodb.net/web2-projekt2?retryWrites=true&w=majority'
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => console.log('Connected to db'))
    .catch((err) => console.log(err))


app.get('/',  function (req, res) {
    res.render('index');
});

//Broken Authentication
app.get('/brokenAuth',  function (req, res) {
    res.render('brokenAuth');
});

app.get('/brokenAuth/register',  function (req, res) {
    res.render('register');
});

app.get('/brokenAuth/login',  function (req, res) {
    res.render('login');
});

app.post('/brokenAuth/registerUser',  function (req, res) {
    const newUser = User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })

    newUser.save().then(() => res.send('You registration is successful <br> <a href="/brokenAuth">Back to broken Authentication</a>'))
        .catch((err) => console.log(err))
});

function findUser(email2,pass, res) {
    User.findOne({email: email2}, function (err, user){
        if(user != null){
            if(user.password === pass){
                res.render('private', {user : user})
            }else{
                res.render('private', {user : null})
            }
        }else{
            res.render('private', {user : user})
        }
    })
}


app.post('/brokenAuth/loginUser', function (req, res) {
    if(req.body.vulnerability !== undefined){
        findUser(req.body.email,req.body.password, res)
    }else{
        const response_key = req.body["g-recaptcha-response"];
        // Put secret key here, which we get from google console
        const secret_key = "6Lf2m5kdAAAAAE--xlavSEP-_oyBjd_Zobz-6yrX";

        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

        fetch2(url, {
            method: "post",
        })
            .then((response) => response.json())
            .then((google_response) => {

                // google_response is the object return by
                // google as a response
                if (google_response.success == true) {
                    //   if captcha is verified
                    return findUser(req.body.email,req.body.password, res);
                } else {
                    // if captcha is not verified
                    return res.send('<h1>You are a robot</h1><h1><a href="/">Home</a></h1>');
                }
            })
            .catch((error) => {
                // Some error while verify captcha
                return res.json({ error });
            });
    }
});

app.get('/xss',  function (req, res) {
    res.render('xss');
});

app.post('/xss/comments', function (req,res){
    if(req.body.vulnerability !== undefined){
        res.render('comments', {comment: req.body.comment})
    }else{
        const escaped_string = validator.escape(req.body.comment);
        res.render('comments', {comment: escaped_string})
    }
});

const hostname = '127.0.0.1';
const port = process.env.PORT || 4010;
if(process.env.PORT){
    app.listen(port, () => console.log('Server running!'))
}else{
    app.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}
