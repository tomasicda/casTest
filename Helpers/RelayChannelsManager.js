var relayChannel = require('../Models/relayChannel');

var RelayChannelsManager = module.exports = {

    incrementSwitchCount: function (channelNum) {

        relayChannel.findOneAndUpdate({ channelNumber: channelNum }, { $inc: { switchCount: 1 }},
            function(err, channel) {
                if (err) throw err;

                if (channel != null) { }

            });
    }

};

module.exports = RelayChannelsManager;

