/**
 * WSK dependencies check module
 */

var exec = require('child_process').exec;
var events = require('events');
var iniparser = require('iniparser');

var PASSED = 'passed',
    FAILED = 'failed';


function filterChecksFor(reqs) {
  var checks = [];

  if (['github', 'heroku'].indexOf(reqs.hostingChoice) >= 0) {
    checks.push(checkGit);
  }

  // if (reqs.hostingChoice === 'gae') {
  //   checks.push(checkGcloud);
  // }

  return checks;
}


function checkAll(reqs) {
  var e = new events.EventEmitter();

  process.nextTick(function () {
    var checks = filterChecksFor(reqs);

    if (checks.length === 0) {
      e.emit('done');
      return;
    }

    var counter = 0, maybeDone = function (result, payload) {
      counter += 1;
      e.emit(result, payload);
      if (counter === checks.length) {
        e.emit('done');
      }
    };

    for (var i = 0; i < checks.length; i++) {
      checks[i](maybeDone);
    };
  });

  return e;
}

function checkGit(callback) {
  exec("git config --list", function (err, stdout) {
    if (err) {
      err = new Error('git: not installed (' + err.message + ')');
      callback(FAILED, {what: 'git', error: err});
      return;
    }

    var data = iniparser.parseString(stdout);

    if (data['user.name'] && data['user.email']) {
      callback(PASSED, {what: 'git', data: data});
    } else {
      var err = new Error('git: not configured');
      callback(FAILED, {what: 'git', data: data, error: err});
    }
  });
}

function checkGcloud(callback) {
  exec("gcloud config list --format json", function (err, stdout) {
    if (err) {
      err = new Error('gcloud: not installed (' + err.message + ')');
      callback(FAILED, {what: 'gcloud', error: err});
      return;
    }

    var cfg = {};
    try {
      cfg = JSON.parse(stdout);
    } catch (err) {}

    if (cfg.core && cfg.core.account) {
      callback(PASSED, {what: 'gcloud', data: cfg});
    } else {
      var err = new Error('gcloud: not configured');
      callback(FAILED, {what: 'gcloud', data: cfg, error: err});
    }
  });
}


module.exports = {
  PASSED: PASSED,
  FAILED: FAILED,
  checkAll: checkAll,
  checkGit: checkGit,
  checkGcloud: checkGcloud
}
