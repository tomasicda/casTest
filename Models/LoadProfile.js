
var mongoose = require('mongoose');

var loadProfileSchema = new mongoose.Schema({
    LoadProfileName: String,
    RunningStatus: Boolean
});

var loadProfile = mongoose.model('loadProfile', loadProfileSchema, 'loadProfile');
module.exports = loadProfile;