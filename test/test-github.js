/*global describe, before, it*/
'use strict';

var fs = require('fs');
var exec = require('child_process').exec;

var assert = require('yeoman-generator').assert;
var chalk = require('chalk');

var testUtil = require('./util');
var deps = require('../app/deps');


describe('mobile:app - GitHub hosting', function () {

  var checkGit;

  before(function (done) {
    deps.checkGit(function (res, data) {
      checkGit = data;
      done();
    });
  });

  describe('project', function () {

    before(function (done) {
      testUtil.mockGitHub();
      testUtil.runGenerator({
        hostingChoice: 'github',
        siteUrl: 'http://owner.github.io/repo',
        githubTarget: 'owner/repo'
      }, done);
    });

    it('has "gulp deploy" task', function () {
      assert.fileContent('tasks/deploy.js', /gulp\.task\('deploy'/);
      assert.fileContent('tasks/deploy.js', /'push', '-u', 'origin', 'gh-pages'/m);
    });

    it('has no CNAME file', function () {
      assert.noFile('app/CNAME');
    });

    it('keeps "dist" in .gitignore', function () {
      assert.fileContent('.gitignore', /^dist\/?$/m);
    });

    it('creates repo in dist/', function (done) {
      if (checkGit.error) {
        console.warn(chalk.yellow('skip because of git check: ' + checkGit.error));
        done();
        return;
      }

      assert.file('dist/.git');
      exec('git status', {cwd: 'dist'}, function (err, stdout) {
        assert.ok(!err, err);
        assert.ok(/working directory clean/m.test(stdout), stdout);
        done();
      });
    });

    it('sets remote to github in dist/.git', function (done) {
      if (checkGit.error) {
        console.warn(chalk.yellow('skip because of git check: ' + checkGit.error));
        done();
        return;
      }

      exec('git remote -v', {cwd: 'dist'}, function (err, stdout) {
        assert.ok(!err, err);
        assert.ok(/^origin\s+git@github\.com:owner\/repo\s+/m.test(stdout), stdout);
        done();
      });
    });

    it('initalizes gh-pages branch in dist/.git', function (done) {
      if (checkGit.error) {
        console.warn(chalk.yellow('skip because of git check: ' + checkGit.error));
        done();
        return;
      }

      exec('git branch', {cwd: 'dist'}, function (err, stdout) {
        assert.ok(!err, err);
        assert.ok(/^\*\sgh-pages$/m.test(stdout), stdout);
        done();
      });
    });

  });  // describe project

  describe('org/user', function () {

    before(function (done) {
      testUtil.mockGitHub();
      testUtil.runGenerator({
        hostingChoice: 'github',
        siteUrl: 'http://owner.github.io',
        githubTarget: 'owner/owner.github.io'
      }, done);
    });

    it('has no CNAME file', function () {
      assert.noFile('app/CNAME');
    });

    it('has "gulp deploy" task', function () {
      assert.fileContent('tasks/deploy.js', /gulp\.task\('deploy'/);
      assert.fileContent('tasks/deploy.js', /'push', '-u', 'origin', 'master'/m);
    });

    it('initalizes master branch in dist/.git', function (done) {
      if (checkGit.error) {
        console.warn(chalk.yellow('skip because of git check: ' + checkGit.error));
        done();
        return;
      }

      exec('git branch', {cwd: 'dist'}, function (err, stdout) {
        assert.ok(!err, err);
        assert.ok(/^\*\smaster$/m.test(stdout), stdout);
        done();
      });
    });

  });  // describe org/user

  describe('custom domain', function () {

    describe('for a user/org', function () {

      before(function (done) {
        testUtil.mockGitHub();
        testUtil.runGenerator({
          hostingChoice: 'github',
          siteUrl: 'http://www.example.org',
          githubTarget: 'owner/owner.github.io'
        }, done);
      });

      it('creates a CNAME for an owner', function () {
        var content = fs.readFileSync('app/CNAME', 'utf8');
        assert.textEqual(content, 'www.example.org');
      });

      it('deploys to correct branch', function () {
        assert.fileContent('tasks/deploy.js', /gulp\.task\('deploy'/);
        assert.fileContent('tasks/deploy.js', /'push', '-u', 'origin', 'master'/m);
      });

    });

    describe('as a repo', function () {

      before(function (done) {
        testUtil.mockGitHub();
        testUtil.runGenerator({
          hostingChoice: 'github',
          siteUrl: 'http://www.example.org',
          githubTarget: 'owner/www.example.org'
        }, done);
      });

      it('creates a CNAME for repo with domain name', function () {
        var content = fs.readFileSync('app/CNAME', 'utf8');
        assert.textEqual(content, 'www.example.org');
      });

      it('deploys to correct branch', function () {
        assert.fileContent('tasks/deploy.js', /gulp\.task\('deploy'/);
        assert.fileContent('tasks/deploy.js', /'push', '-u', 'origin', 'gh-pages'/m);
      });

    });

  });  // describe custom domain

});
