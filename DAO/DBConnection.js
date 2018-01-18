var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/vlbc');
//mongoose.connect('mongodb://vlbcergon:vlbcergon@ds047612.mlab.com:47612/vlbv');

console.log("MONGOOSE CONNECT IS JUST CALLED");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('We are connected');
});
