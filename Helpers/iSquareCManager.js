//var i2cLib = require('../node_modules/pcduino-i2c/pcduino-i2c');
var relayChannel = require('../Models/relayChannel');

var i2cManager = module.exports = {

    byteNumber: 0,

    channelsAssigned: false,

    currentChannels: [],
    
    write: function(byteNumber, relayShieldNumber) {

        //console.log("INSIDE i2C MANAGER...............BYTE NUM " + byteNumber + "  SHIELD NUM " + relayShieldNumber);
        //i2cLib.init(relayShieldNumber);
        //i2cLib.enable(byteNumber);

    },

    calculateByteNumberByStatusAndWrite: function(channels, relayShieldNumber) {

        i2cManager.byteNumber = 0;

        for (var channel in channels) {

            if (channels[channel].status === true) {

                switch (channels[channel].channelNumber) {
                    case 1:
                        i2cManager.byteNumber += 1;
                        break;
                    case 2:
                        i2cManager.byteNumber += 2;
                        break;
                    case 3:
                        i2cManager.byteNumber += 4;
                        break;
                    case 4:
                        i2cManager.byteNumber += 8;
                        break;
                    case 5:
                        i2cManager.byteNumber += 16;
                        break;
                    case 6:
                        i2cManager.byteNumber += 32;
                        break;
                    case 7:
                        i2cManager.byteNumber += 64;
                        break;
                    case 8:
                        i2cManager.byteNumber += 128;
                        break;
                }
            }
        }
        //console.log("BYTE VALUE CALCULATED FOR RELAY SHIELD :::: " + i2cManager.byteNumber);
        i2cManager.write(i2cManager.byteNumber, relayShieldNumber);
    },

    automaticUpdate: function (profile) {

        i2cManager.byteNumber =  0;
        var profilePower = profile.Power;

        relayChannel.find({}).sort({watts: 'desc'}).exec(function(err, channels) {

            if (err){
                console.log(err);
                return res.status(500).send();
            }
            if (!channels){
                return res.status(401).send();
            }

            /*
             *  this part is important, we could have channels added manually.
             *  However order of channels is important and can be changed in future.
             */
            if(i2cManager.channelsAssigned === false) {

                i2cManager.currentChannels = channels;
                i2cManager.channelsAssigned = true;

                // // loggin only for testing purposes
                // console.log("CHANNELS' AND THEIR CURRENT STATUS");
                // var tally = 0;
                // i2cManager.currentChannels.forEach(function(ch) {
                //     if(tally >= 8) {
                //         return false;
                //     }
                //     console.log("\tCHANNEL: " + ch.channelNumber + " STATUS " + ch.status);
                //     tally++;
                // });

            }

            var counter = 0;

            channels.forEach(function(channel) {

                if (channel.watts  <= profilePower) {

                    profilePower =  profilePower - channel.watts;

                    channel.status = true;

                    switch (channel.channelNumber) {
                        case 1:
                            i2cManager.byteNumber += 1;
                            break;
                        case 2:
                            i2cManager.byteNumber+= 2;
                            break;
                        case 3:
                            i2cManager.byteNumber += 4;
                            break;
                        case 4:
                            i2cManager.byteNumber += 8;
                            break;
                        case 5:
                            i2cManager.byteNumber += 16;
                            break;
                        case 6:
                            i2cManager.byteNumber += 32;
                            break;
                        case 7:
                            i2cManager.byteNumber += 64;
                            break;
                        case 8:
                            i2cManager.byteNumber += 128;
                            break;
                    }

                } else {

                    channel.status = false;
                }


                var query = {$set: {status: channel.status}};


                // if channel status changed query increments switch count for channel
                if(channel.status !== i2cManager.currentChannels[counter].status) {

                    console.log("\tCHANNEL: " + channel.channelNumber + " STATUS " + i2cManager.currentChannels[counter].status + " -> " + channel.status);
                    i2cManager.currentChannels[counter].status = channel.status;
                    query = {$set: {status: channel.status}, $inc: { switchCount: 1 }};

                }


                relayChannel.update({channelNumber: channel.channelNumber}, query, function (err, channel) {

                        if (err)
                            console.log(err);
                        if (!channel)
                            console.log("\nCOULD NOT FIND CHANNEL TO UPDATE in 12c MANAGER\n");
                    }

                );

                counter++;

            });

            //console.log("%j", i2cManager.currentChannels);

            console.log("CURRENT RUNNING SIMULATION BYTE VALUE :::: " + i2cManager.byteNumber);
            i2cManager.write(i2cManager.byteNumber, 32);
        });

    }


};

module.exports = i2cManager;
