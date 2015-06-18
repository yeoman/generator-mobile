'use strict';
var spawn = require('child_process').spawn;
var gulp = require('gulp');

gulp.task('deploy', ['default'], function (done) {
  var args = ['preview', 'app', 'deploy', 'dist'];

  if (process.argv.length > 3) {
    args.push.apply(args, process.argv.slice(3));
  }

  console.log('gcloud', args.join(' '));

  spawn('gcloud', args, {stdio: 'inherit'}).on('close', function (code) {
    done();
    process.exit(code);
  });
});
