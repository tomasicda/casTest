var mongoose = require('mongoose');

var profileDataSetSchema = new mongoose.Schema({
    LoadProfileName: String,
    Time: { Hours: Number, Minutes: Number },
    Power: Number
});

var profileDataSet = mongoose.model('profileDataSet', profileDataSetSchema, 'profileDataSet');
module.exports = profileDataSet;