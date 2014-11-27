'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var gulp = require('gulp');
var runSequence = require('run-sequence');


// Deployment to GitHub using git.
gulp.task('deploy', ['default'], function (done) {
  runSequence('deploy:commit', 'deploy:push', done);
});

// Commit changes to production build locally.
gulp.task('deploy:commit', function (done) {
  var msg, im = process.argv.indexOf('-m');
  if (im >= 0) {
    msg = process.argv.slice(im, im + 2)[1];
  }
  msg = msg || 'Production build';
  var cmd = ["git add .", "git commit -m '" + msg + "'", "git status"];
  exec(cmd.join(' && '), {cwd: path.join(process.cwd(), 'dist')}, function (err, stdout, stderr) {
    if (!/working directory clean/m.test(stdout)) {
      console.log('--- ERROR log ---\n' + stderr);
      console.log('--- STDOUT log ---\n' + stdout);
      throw err || new Error('deploy:commit');
    }
    done();
  });
});

// Push changes to remote (actual deployment).
gulp.task('deploy:push', function (done) {
  var cwd = path.join(process.cwd(), 'dist');
  var args = ['push', '-u', 'origin', '<%= prompts.githubBranch %>'];
  spawn('git', args, {cwd: cwd, stdio: 'inherit'}).on('close', function (code) {
    if (code != 0) {
      throw new Error('deploy:push exit code is ' + code);
    }
    done();
  });
});
