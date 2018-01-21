var mongoose = require("mongoose");

//If DB is running on local machine
    //mongoose.connect('mongodb://localhost/casTest');

//Main remoteDB
    //mongoose.connect('mongodb://vlbcergon:vlbcergon@ds047612.mlab.com:47612/vlbv');

//Test remoteDB
    mongoose.connect('mongodb://oldm8:Protec09@ds035593.mlab.com:35593/flights');


console.log("MONGOOSE CONNECT IS JUST CALLED");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('We are connected');
});
