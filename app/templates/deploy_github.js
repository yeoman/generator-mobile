'use strict';

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var gulp = require('gulp');

// Deployment to GitHub using git.
gulp.task('deploy', function (done) {
  var args = ['push'];
  if (process.argv.length > 3) {
    args.push.apply(args, process.argv.slice(3));
  }
  console.log('git', args.join(' '));

  var cwd = path.join(process.cwd(), 'dist');
  spawn('git', args, {cwd: cwd, stdio: 'inherit'}).on('close', function (code) {
    done();
    if (code != 0) {
      process.exit(code);
    }
  });
});
