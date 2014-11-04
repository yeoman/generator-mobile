/**
 * WSK dependencies check module
 */

var exec = require('child_process').exec;
var events = require('events');


function checkAll(reqs) {
  var e = new events.EventEmitter();

  var checks = [checkGit];

  process.nextTick(function () {
    var counter = 0, maybeDone = function (result, data) {
      counter += 1;
      e.emit(result, data);
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
  exec("git config --get-regexp 'user\..*'", function (err, stdout) {
    if (err) {
      callback('failed', {what: 'git', error: err});
      return;
    }

    var user = stdout.match(/^user\.name\s+(.+)$/m);
    var email = stdout.match(/^user\.email\s+(.+)$/m);

    if (user && user[1] && email && email[1]) {
      callback('passed', {what: 'git'});
    } else {
      callback('failed', {what: 'git', error: new Error('Git: not configured')});
    }
  });
}

module.exports = {
  checkAll: checkAll,
  checkGit: checkGit
}
