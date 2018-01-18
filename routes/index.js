var express = require('express');
var router = express.Router();
var User = require('../Models/User');
var dbConnection = require('../DAO/DBConnection');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Login | VLBC', success: req.session.success
    });
});

function restrict(req, res, next) {
    if (req.session.success) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/logout', function(req, res){
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
        res.redirect('/');
    });
});

router.get('/test', restrict,function (req, res){
    res.render('test', {
        title: 'Test | VLBC'
    });
});

router.get('/login', restrict, function(req, res){
    res.render('homePage', {
        title: 'Home | VLBC'
    });
});

router.post('/login',function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({username: username, password: password}, function (err, user) {
        console.log(user);
        if (err){
            req.session.success = false;
            console.log(err);
            res.redirect('/');
            return res.status(500).send();
        }
        if (!user){
            req.session.success = false;
            res.redirect('/');
            return res.status(401).send();

        }
        req.session.success = true;
        res.render('homePage', {
            title: 'Home | VLBC'
        });
    });
});

module.exports = router;
