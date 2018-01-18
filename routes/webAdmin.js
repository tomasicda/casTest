var express = require('express');
var admin = express.Router();
var User = require('../Models/User');
var relayChannel = require('../Models/relayChannel');
var restrict = require('../DAO/Session');


admin.get('/', restrict, function (req, res, next) {

    res.render('webAdmin', {
        title: 'Web Admin | VLBC'
    });

});


admin.post('/addRelayChannels', restrict, function(req, res, next) {

    var admin = false;
    if(admin) {

        var test = req.body;
        //console.log(test.addRelayChannels);

        // load back configured with following static watts
        var channelWatts = [
            /* channel 1 -> */ 100,
            /* channel 2 -> */ 200,
            /* channel 3 -> */ 300,
            /* channel 4 -> */ 400,
            /* channel 5 -> */ 1000,
            /* channel 6 -> */ 2000,
            /* channel 7 -> */ 1500,
            /* channel 8 -> */ 2000,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ];

        var counter = 0;

        for (var channelNum = 1; channelNum <= 24; channelNum++) {

            var channel = new relayChannel({
                channelNumber: channelNum,
                status: false,
                switchCount: 0,
                watts: channelWatts[counter]
            });

            channel.save(function (err, name) {
                if(err) throw err;

                console.log('relayCHannel insert: ' + name);
            });

            counter++;
        }

        res.send({message: "successful"});

    } else {
        res.send({message: "unsuccessful"})
    }

});


module.exports = admin;
