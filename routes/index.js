var express = require('express');
var router = express.Router();
var User = require('../Models/User');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Login | VLBC', success: req.session.success
    });
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(){
        res.redirect('/');
    });
});

router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({username: username, password: password}, function (err, user) {

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

        res.redirect('/admin/loadProfiles');
    });
});

module.exports = router;
