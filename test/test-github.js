'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var assert = require('yeoman-generator').assert;

var testUtil = require('./util');
var deps = require('../app/deps');

describe('mobile:app - GitHub hosting', function () {

  describe('project', function () {

    var answers = {
      hostingChoice: 'github',
      siteUrl: 'http://owner.github.io/repo',
      githubTarget: 'owner/repo'
    };

    before(function (done) {
      testUtil.mockGitHub();
      testUtil.runGenerator(answers, done);
    });

    it('has "gulp deploy" task', function () {
      assert.fileContent('tasks/deploy.js', /gulp\.task\('deploy'/);
    });

    it('has no CNAME file', function () {
      assert.noFile('app/CNAME');
    });

    deps.checkGit(function (res) {

      if (res !== 'passed') {
        xit('skipping git-based tests');
        return;
      }

      it('creates repo in dist/', function (done) {
        assert.file('dist/.git');
        exec('git status', {cwd: 'dist'}, function (err, stdout) {
          assert.ok(!err, err);
          assert.ok(/working directory clean/m.test(stdout), stdout);
          done();
        });
      });

      it('includes dist/ subrepo into the main repo', function (done) {
        assert.noFileContent('.gitignore', /^dist\/?$/m);
        exec('git status', function (err, stdout) {
          assert.ok(!err, err);
          assert.ok(/working directory clean/m.test(stdout), stdout);
          done();
        });
      });

      it('sets remote to github in dist/.git', function (done) {
        exec('git remote -v', {cwd: 'dist'}, function (err, stdout) {
          assert.ok(!err, err);
          assert.ok(/^origin\s+git@github\.com:owner\/repo\s+/m.test(stdout), stdout);
          done();
        });
      });

      it('initalizes gh-pages branch in dist/.git', function (done) {
        exec('git branch', {cwd: 'dist'}, function (err, stdout) {
          assert.ok(!err, err);
          assert.ok(/^\*\sgh-pages$/m.test(stdout), stdout);
          done();
        });
      });

    });

  });  // describe project

  describe('org/user', function () {

    var answers = {
      hostingChoice: 'github',
      siteUrl: 'http://owner.github.io',
      githubTarget: 'owner/owner.github.io'
    };

    before(function (done) {
      testUtil.mockGitHub();
      testUtil.runGenerator(answers, done);
    });

    it('has no CNAME file', function () {
      assert.noFile('app/CNAME');
    });

    deps.checkGit(function (res) {

      if (res !== 'passed') {
        xit('skipping git-based tests');
        return;
      }

      it('initalizes master branch in dist/.git', function (done) {
        exec('git branch', {cwd: 'dist'}, function (err, stdout) {
          assert.ok(!err, err);
          assert.ok(/^\*\smaster$/m.test(stdout), stdout);
          done();
        });
      });

    });

  });  // describe org/user

  describe('custom domain', function () {

    it('creates a CNAME for an owner', function (done) {
      var answers = {
        hostingChoice: 'github',
        siteUrl: 'http://www.example.org',
        githubTarget: 'owner/owner.github.io'
      };
      testUtil.mockGitHub();
      testUtil.runGenerator(answers, function () {
        var content = fs.readFileSync('app/CNAME', 'utf8');
        assert.textEqual(content, 'www.example.org')
        done()
      });
    });

    it('creates a CNAME for repo with domain name', function (done) {
      var answers = {
        hostingChoice: 'github',
        siteUrl: 'http://www.example.org',
        githubTarget: 'owner/www.example.org'
      };
      testUtil.mockGitHub();
      testUtil.runGenerator(answers, function () {
        var content = fs.readFileSync('app/CNAME', 'utf8');
        assert.textEqual(content, 'www.example.org')
        done()
      });
    });

  });  // describe custom domain

});
