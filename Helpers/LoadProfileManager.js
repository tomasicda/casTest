var profileDataSet = require('../Models/LoadProfileDataSet');
var relayChannel = require('../Models/relayChannel');
var relayChannelsManager = require('../Helpers/RelayChannelsManager');
var i2cManager = require('../Helpers/iSquareCManager');

var LoadProfileManager = module.exports = {

    timer: "",

    runningSpeed: "",

    currentLoadProfileTime: { /* Hours: 0, Minutes: 0 */ },

    stopSimulation: function() {
        clearTimeout(LoadProfileManager.timer);
        LoadProfileManager.runningSpeed = "";
    },

    startSimulation: function (loadProfileToRun, speed) {

        LoadProfileManager.stopSimulation();

        LoadProfileManager.runningSpeed = speed;

        // get current time from system
        var date = new Date();
        var currentHours = date.getHours();
        var currentMinutes = date.getMinutes();
        var currentSeconds = date.getSeconds();
        var calculateTimeLeftFor = 'today';

        // prepare query for next simulation setup function
        var query = {LoadProfileName: loadProfileToRun, Time:{$gt:{Hours: currentHours, Minutes: currentMinutes}}};

        //logging for testing purposes
        console.log("\n||==============================================");
        console.log("SIMULATION STARTED AT -> " + currentHours+ ":" + currentMinutes + ":" + currentSeconds + " HMS");
        console.log("||==============================================");

        /*
         * - find next simulation load time data set.
         * - calculate seconds left to start next simulation
         */
        function getNextSimulationDataSet(query, calculateTimeLeftFor, callback) {

            var nextLoadTimeDataSetWithTimeLeftToRun = null;

            profileDataSet.findOne(query).exec(function (err, loadTimeDataSet) {

                if (err) throw err;

                if (loadTimeDataSet === null) {

                    // callback returns null and handled by execution callback function

                } else {

                    var date = new Date();
                    var nextLoadProfileTimeInSeconds, currentTimeInSeconds, currentLoadProfileTimeInSeconds, secondsLeftForTimeOut;

                    function convertHoursToSeconds(hours){
                        return hours * 60 * 60;
                    }

                    function convertMinutesToSeconds(minutes){
                        return minutes * 60;
                    }

                    if(calculateTimeLeftFor === 'today') {
                        nextLoadProfileTimeInSeconds = convertHoursToSeconds(loadTimeDataSet.Time.Hours) + convertMinutesToSeconds(loadTimeDataSet.Time.Minutes);
                        currentTimeInSeconds = convertHoursToSeconds(date.getHours()) + convertMinutesToSeconds(date.getMinutes()) + date.getSeconds();
                        currentLoadProfileTimeInSeconds = convertHoursToSeconds(LoadProfileManager.currentLoadProfileTime.Hours) + convertMinutesToSeconds(LoadProfileManager.currentLoadProfileTime.Minutes);

                        // NEED TO SUBTRACT FROM WHATEVER IS HIGHER VALUE BETWEEN currentLoadProfileTimeInSeconds OR currentTimeInSeconds THAT SHOULD FIX THE ISSUE
                        if(currentLoadProfileTimeInSeconds > currentTimeInSeconds || currentTimeInSeconds > nextLoadProfileTimeInSeconds) {
                            secondsLeftForTimeOut = nextLoadProfileTimeInSeconds - currentLoadProfileTimeInSeconds;
                        } else {
                            secondsLeftForTimeOut = nextLoadProfileTimeInSeconds - currentTimeInSeconds;
                        }

                        // testing
                        // console.log("Next Load Profile Seconds: " + nextLoadProfileTimeInSeconds);
                        // console.log("Current Load Profile Seconds: " + currentLoadProfileTimeInSeconds);
                        // console.log("System time Seconds: " + currentTimeInSeconds);

                    } else if (calculateTimeLeftFor === 'nextDay') {
                        nextLoadProfileTimeInSeconds = convertHoursToSeconds(loadTimeDataSet.Time.Hours) + convertMinutesToSeconds(loadTimeDataSet.Time.Minutes);
                        currentTimeInSeconds = convertHoursToSeconds(date.getHours()) + convertMinutesToSeconds(date.getMinutes()) + date.getSeconds();
                        currentLoadProfileTimeInSeconds = convertHoursToSeconds(LoadProfileManager.currentLoadProfileTime.Hours) + convertMinutesToSeconds(LoadProfileManager.currentLoadProfileTime.Minutes);


                        // testing
                        // console.log("Next Load Profile Seconds: " + nextLoadProfileTimeInSeconds);
                        // console.log("Current Load Profile Seconds: " + currentLoadProfileTimeInSeconds);
                        // console.log("System time Seconds: " + currentTimeInSeconds);

                        //var timeToNextDay = 86400 - currentLoadProfileTimeInSeconds;
                        var timeToNextDay = 86400;

                        if(currentLoadProfileTimeInSeconds > currentTimeInSeconds || currentTimeInSeconds > nextLoadProfileTimeInSeconds) {
                            timeToNextDay = timeToNextDay - currentLoadProfileTimeInSeconds;
                        } else {
                            timeToNextDay = timeToNextDay - currentTimeInSeconds;
                        }


                        secondsLeftForTimeOut =  timeToNextDay + nextLoadProfileTimeInSeconds;
                    }

                    loadTimeDataSet.TimeLeft = secondsLeftForTimeOut * 1000 / LoadProfileManager.runningSpeed;

                    console.log("LOAD PROFILE SPEED: " + LoadProfileManager.runningSpeed + "x.........SECONDS LEFT FOR NEXT PROFILE TO RUN: " + loadTimeDataSet.TimeLeft / 1000);

                    nextLoadTimeDataSetWithTimeLeftToRun = loadTimeDataSet;

                    LoadProfileManager.currentLoadProfileTime.Hours = loadTimeDataSet.Time.Hours;
                    LoadProfileManager.currentLoadProfileTime.Minutes = loadTimeDataSet.Time.Minutes;
                }



                callback(nextLoadTimeDataSetWithTimeLeftToRun);

            }); //database query ends here

        } //getNextSimulationDataSet ends here


        function setupNextSimulation(query, calculateTimeLeftFor) {

            getNextSimulationDataSet(query, calculateTimeLeftFor, function(loadTimeDataSet) {

                if (loadTimeDataSet === null) {
                    console.log("::::::::::NEXT SIMULATION STARTS TOMORROW:::::::::");
                    var calculateTimeLeftFor = 'nextDay';
                    var query  = {LoadProfileName: loadProfileToRun, Time:{$gte:{Hours: 0, Minutes: 0}}};
                    setupNextSimulation(query, calculateTimeLeftFor);

                } else {

                    console.log("NEXT SIMULATION DATA SET TO RUN......POWER: " + loadTimeDataSet.Power + "........TIME " + loadTimeDataSet.Time.Hours + ":" + loadTimeDataSet.Time.Minutes);
                    console.log("||==============================================");

                    LoadProfileManager.timer = setTimeout(function () {

                        console.log("\n||==============================================");
                        console.log("CURRENT RUNNING LOAD PROFILE NAME: \"" + loadTimeDataSet.LoadProfileName + "\" -- DATA SET......Power: " + loadTimeDataSet.Power + ".......TIME " + loadTimeDataSet.Time.Hours + ":" + loadTimeDataSet.Time.Minutes);

                        //var date = new Date();
                        var today = 'today';
                        //var query = {LoadProfileName: loadProfileToRun, Time:{$gt:{Hours: date.getHours(), Minutes: date.getMinutes()}}};
                        var query = {LoadProfileName: loadProfileToRun, Time:{$gt:{Hours: LoadProfileManager.currentLoadProfileTime.Hours, Minutes: LoadProfileManager.currentLoadProfileTime.Minutes }}};

                        i2cManager.automaticUpdate(loadTimeDataSet);
                        setupNextSimulation(query, today);

                    }, loadTimeDataSet.TimeLeft);
                }

            }); //getNextSimulationDataSet() ends here

        } //setupNextSimulation() ends here


        /*
         * - find current simulation (Load(watts) And Time Data Set) from profileDataSet (mongodb collection/table).
         */
        profileDataSet.findOne({LoadProfileName: loadProfileToRun, Time: {$lte: {Hours: currentHours, Minutes: currentMinutes} } }).sort({Time: -1}).limit(1).exec(function (err, loadTimeDataSet) {

            if(err) throw err;

            if(loadTimeDataSet === null) {
                console.log("\n||==============================================");
                console.log("SYSTEM CAN'T FIND LOAD TIME DATA SET TO SIMULATE");
            } else {
                console.log("\n||==============================================");
                console.log("CURRENT RUNNING LOAD PROFILE NAME: \"" + loadTimeDataSet.LoadProfileName + "\" -- DATA SET......Power: " + loadTimeDataSet.Power + ".......TIME " + loadTimeDataSet.Time.Hours + ":" + loadTimeDataSet.Time.Minutes);

                LoadProfileManager.currentLoadProfileTime.Hours = loadTimeDataSet.Time.Hours;
                LoadProfileManager.currentLoadProfileTime.Minutes = loadTimeDataSet.Time.Minutes;

                /*
                 * - calculate which relay channels should be on/off from watts.
                 * - update each channels' status and switch tally in relayChannel (mongodb collection).
                 * - signal i2c to write on relay shield hardware itself to switch channels.
                 */
                i2cManager.automaticUpdate(loadTimeDataSet);

                /*
                 * - set timer to start next simulation
                 */
                setupNextSimulation(query, calculateTimeLeftFor);
            }
        });


    } //startSimulation ends here
};

module.exports = LoadProfileManager;

