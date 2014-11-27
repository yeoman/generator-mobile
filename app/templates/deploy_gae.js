'use strict';

var fs = require('fs');
var spawn = require('child_process').spawn;
var gulp = require('gulp');

// Deployment to Google App Engine (GAE) using gcloud tool.
gulp.task('deploy', ['default'], function (done) {
  var args = ['preview', 'app', 'deploy', 'dist'];
  if (process.argv.length > 3) {
    args.push.apply(args, process.argv.slice(3));
  }
  console.log('gcloud', args.join(' '));
  spawn('gcloud', args, { stdio: 'inherit' }).on('close', function (code) {
    done();
    if (code != 0) {
      process.exit(code);
    }
  });
});
