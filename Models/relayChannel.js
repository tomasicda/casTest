var mongoose = require('mongoose');


var relayChannelSchema = new mongoose.Schema({
    channelNumber: Number,
    status: Boolean,
    switchCount: Number,
    watts: Number
});

var relayChannel = mongoose.model('relayChannel', relayChannelSchema, 'relayChannel');
module.exports = relayChannel;