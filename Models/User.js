var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

var User = mongoose.model('login', userSchema, 'login');
module.exports = User;