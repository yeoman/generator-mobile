// Check use username and api
var saucelabsUsername = process.argv[2];
var saucelabsAPIKey = process.argv[3];

if(typeof saucelabsUsername === 'undefined' || typeof saucelabsAPIKey === 'undefined' || saucelabsUsername === '<username>' || saucelabsAPIKey === '<apikey>') {
  console.log('You need to set your Saucelabs username and password in the Gruntfile.js file');
  return;
}

// Required Modules
var webdriver = require('wd')
  , assert = require('assert')
  , fs = require('fs')
  , mkdirp = require('mkdirp')
  , spawn = require('child_process').spawn;

var tunnelCommand = 'java';

// Define the strings for landscape & portrait
var PORTRAIT = "PORTRAIT";
var LANDSCAPE = "LANDSCAPE";

var configurations = [
  {
    browserName: 'android',
    version: '4',
    platform: 'Linux',
    deviceType: 'tablet',
    name: "Yeoman Test - Android-Tablet"
  },
  {
    browserName: 'android',
    version: '4',
    platform: 'Linux',
    name: "Yeoman Test - Android-Phone"
  },
  {
    browserName: 'iphone',
    version: '6',
    platform: 'OS X 10.8',
    name: "Yeoman Test - iPhone"
  },
  {
    browserName: 'ipad',
    version: '6',
    platform: 'OS X 10.8',
    name: "Yeoman Test - iPad"
  }
];

var remoteWebDriver;

/**************************
 * Connect tunnel
 *************************/
console.log('Connecting to tunnel');
var saucelabsTunnel = spawn(tunnelCommand, ['-jar', './test/saucelabs/Sauce-Connect.jar', saucelabsUsername, saucelabsAPIKey]);

saucelabsTunnel.stdout.on('data', function (data) {
  //console.log('> ' + data);
  var string = ''+data;
  if(string.indexOf('Connected! You may start your tests.') > 0) {
    connectWebDriver(function() {
      saucelabsTunnel.kill();
    });
  }
});

saucelabsTunnel.stderr.on('data', function (data) {
  console.log('ERROR > : ' + data);
});

saucelabsTunnel.on('close', function (code) {
  if (code !== 0) {
    console.log('The Saucelabs Tunnel ended with code ' + code);
  }
});

function connectWebDriver(cb) {
    remoteWebDriver = webdriver.remote(
      "ondemand.saucelabs.com"
      , 80
      , saucelabsUsername
      , saucelabsAPIKey
    );

    remoteWebDriver.on('status', function(info){
      console.log('\x1b[36m%s\x1b[0m', info);
    });

    remoteWebDriver.on('command', function(meth, path){
      console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
    });

    performTests(0, configurations, cb);
}

function performTests(currentConfig, configurations, cb) {
  var date = new Date();
  var dateString = '' + date.getMonth() + date.getDay() +
  date.getFullYear() + date.getHours() +
  date.getMinutes() + date.getSeconds();

  var screenshotConfig = {
    directory: __dirname+'/screenshots/'+dateString+'/'
  };

  startTest(currentConfig, configurations, screenshotConfig, cb)();
}

function startTest(currentIndex, configurations, screenshotConfig, cb) {
  return function() {
    if(currentIndex < configurations.length) {
      var config = configurations[currentIndex];
      config.orientation = PORTRAIT;

      mkdirp(screenshotConfig.directory + config.name + '/',function(err){
        runTest(
          config,
          screenshotConfig,
          startTest(currentIndex+1, configurations, screenshotConfig, cb)
        );
      });
    } else {
      cb();
    }
  }
}

function runTest(config, screenshotConfig, cb) {
  console.log("==============================================");
  console.log("New Test");
  console.log("config.orientation = "+config.orientation);
  console.log("config.name = "+config.name);
  console.log("==============================================");

  remoteWebDriver.chain()
    .init(config)
    .get('http://localhost:9000/')
    .setOrientation(config.orientation, function(err) {
      console.log("Setting orientation to "+config.orientation);
      if(err) {
        console.log("setOrientation() Error = "+err);
      }
    })
    .execute('window.scrollTo(0, 0);', function() {
      console.log("Scrolled window to 0, 0");
      takeScreenshot(config, screenshotConfig, function() {
        console.log("Screenshot taken");
        remoteWebDriver.quit(function() {
            if(config.orientation == PORTRAIT) {
              config.orientation = LANDSCAPE;
              config.currentScrollY = 0;
              runTest(config, screenshotConfig, cb);
            } else {
              cb();
            }
          });
      });
    });
}

function takeScreenshot(config, screenshotConfig, cb) {
  console.log("Taking Screenshot");

  var screenshotLocation = getScreenShotLocation(config, screenshotConfig);
  remoteWebDriver.takeScreenshot(saveScreenshot(screenshotLocation, cb));
}

function getScreenShotLocation(config, screenshotConfig) {
  var fileName = 'screenshot';
  if(config.orientation) {
    fileName += '-'+config.orientation;
  }
  fileName += '.png';

  return screenshotConfig.directory+config.name+"/"+fileName;
}

function saveScreenshot(directory, cb) {
  return function(err, screenshot) {
    console.log("Saving Screenshot");
    // Write to file
    if(!screenshot) {
      console.log("ERROR: no screenshot received");
      cb();
      return;
    }

    var buffer = new Buffer(screenshot, "base64");
    fs.writeFile(directory, buffer, function(err) {
      if(err) {
        console.log("ERROR: screenshot couldn't be saved: "+err);
      }
      cb();
    });
  };
}