var express = require('express');
var admin = express.Router();
var User = require('../Models/User');
var loadProfileDataSet = require('../Models/LoadProfileDataSet');
var relayChannel = require('../Models/relayChannel');
var loadProfile = require('../Models/LoadProfile');
var LoadProfileManager = require('../Helpers/LoadProfileManager');
var restrict = require('../DAO/Session');


admin.get('/loadProfiles', restrict,function (req, res) {

    // get all load profile names and their status only (excluding _id)
    loadProfile.find({}, {LoadProfileName: 1, RunningStatus: 1, _id:0}, function(err, loadProfiles) {

        if(err) throw err;

        res.render('loadProfiles', {
            title: 'load profiles - admin | VLBC',
            loadProfiles: loadProfiles,
            runningSpeed: LoadProfileManager.runningSpeed
        });
    });

});

admin.post('/loadProfile', restrict,function (req, res) {

    var loadProfileName = req.body.loadProfileName;

    loadProfileDataSet.find({LoadProfileName: loadProfileName}, function(err, dataSets){

        if(err) throw err;

        res.render('loadProfile', {
            title: 'Load Profile | VLBC',
            loadProfile: dataSets
        });
    });

});

admin.post('/StartLoadProfile', restrict, function (req, res, next) {

    var startLoadProfile = req.body.runLoadProfileName;
    var speed = req.body.speed;

    // Updating currently Running loadProfile status to false
    loadProfile.update({RunningStatus: true}, {RunningStatus: false},
        function (err, num) {
            if (err) throw err;

            // test logs
            //console.log("Modified load profiles running status:")
            //console.log(JSON.stringify(num, null, 2));
    });

    // Update RunningStatus of requested loadProfile to true
    loadProfile.update({LoadProfileName: startLoadProfile}, {$set: {RunningStatus: true}}, function(err, loadProfile){

        if(err) throw err;

        // start load profile simulation
        LoadProfileManager.startSimulation(startLoadProfile, speed);

        res.redirect('loadProfiles');
    });

});


admin.post('/StopLoadProfile', restrict, function (req, res) {

    LoadProfileManager.stopSimulation();

    res.redirect('loadProfiles');
});



admin.post('/uploadExcelLoadProfile', restrict, function(req, res) {

    var profiles = req.body;
    var loadProfileName = profiles.shift();
    loadProfileName = loadProfileName.LoadProfileName;

    loadProfile.create({LoadProfileName: loadProfileName, RunningStatus: false}, function (err, savedProfile) {
        if (err) throw err;

        profiles.forEach(function(profile) {

            var profe = new loadProfileDataSet({
                LoadProfileName: loadProfileName,
                Time: {Hours: profile.Time.Hours, Minutes: profile.Time.Minutes },
                Power: parseFloat(profile.Power)

            });

            profe.save(function (err, name) {
                if(err) throw err;

                // test logs
                //console.log('profe goes here' + name);
            });

        });

        res.send({message: "successful"});
    });


});

admin.post('/deleteLoadProfile', restrict, function(req, res){

    var loadProfileName = req.body.loadProfileName;

    loadProfile.remove({ LoadProfileName: loadProfileName}, function (err) {

        if (err) {

            res.send({message: "unsuccessful"});
            throw err;

        } else {

            loadProfileDataSet.remove({LoadProfileName: loadProfileName}, function(err){

                if (err) {
                    res.send({message: "unsuccessful"});
                    throw err;

                } else {
                    res.send({message: "successful"});
                }
            });
        }

    });

});

/* getting relay channel details with ajax call */
admin.get('/relayChannels', restrict, function(req, res, next){

    relayChannel.find(function (err, channels) {
        if (err){
            console.log(err);
            return res.status(500).send();
        }
        if (!channels){
            return res.status(401).send();
        }

        // testing logs
        // channels.forEach(function(channel) {
        //    console.log(channel.channelNumber);
        //     console.log(channel.watts);
        //
        // });

        res.render('relayChannels', {
            title: 'relay channels - admin | VLBC',
            allChannels: channels
        });
    });

});

admin.post('/resetRelayCount', restrict, function(req, res, next){

    var data = req.body;

    console.log('Sever has been activated  ' ,data);

    relayChannel.findOneAndUpdate({channelNumber: data.channelNumber},
                                  {$set: {switchCount: 0}},
                                  {new: true},
        function (err, channel) {
            if(err) throw err;
            res.send({switchCount: channel.switchCount});
    });

});


module.exports = admin;
