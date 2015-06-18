'use strict';
var exec = require('child_process').exec;
var events = require('events');
var iniparser = require('iniparser');
var PASSED = 'passed';
var FAILED = 'failed';

function checkGit(cb) {
  exec('git config --list', function (err, stdout) {
    if (err) {
      err = new Error('git: not installed (' + err.message + ')');
      cb(FAILED, {what: 'git', error: err});
      return;
    }

    var data = iniparser.parseString(stdout);

    if (!data['user.name'] || !data['user.email']) {
      var errNoConf = new Error('git: not configured');
      cb(FAILED, {what: 'git', data: data, error: errNoConf});
      return;
    }

    cb(PASSED, {what: 'git', data: data});
  });
}

function checkGcloud(cb) {
  exec('gcloud config list --format json', function (err, stdout) {
    if (err) {
      err = new Error('gcloud: not installed (' + err.message + ')');
      cb(FAILED, {what: 'gcloud', error: err});
      return;
    }

    var cfg = {};

    try {
      cfg = JSON.parse(stdout);
    } catch (err) {}

    if (!cfg.core || !cfg.core.account) {
      var errNoConf = new Error('gcloud: not configured');
      cb(FAILED, {what: 'gcloud', data: cfg, error: errNoConf});
      return;
    }

    cb(PASSED, {what: 'gcloud', data: cfg});
  });
}

function filterChecksFor(reqs) {
  var checks = [];

  if (['github', 'heroku'].indexOf(reqs.hostingChoice) >= 0) {
    checks.push(checkGit);
  }

  if (reqs.hostingChoice === 'gae') {
    checks.push(checkGcloud);
  }

  return checks;
}

function checkAll(reqs) {
  var e = new events.EventEmitter();

  process.nextTick(function () {
    var checks = filterChecksFor(reqs);
    var counter = 0;

    if (checks.length === 0) {
      e.emit('done');
      return;
    }

    function maybeDone(result, payload) {
      counter += 1;
      e.emit(result, payload);

      if (counter === checks.length) {
        e.emit('done');
      }
    }

    for (var i = 0; i < checks.length; i++) {
      checks[i](maybeDone);
    }
  });

  return e;
}

module.exports = {
  PASSED: PASSED,
  FAILED: FAILED,
  checkAll: checkAll,
  checkGit: checkGit,
  checkGcloud: checkGcloud
};
