'use strict';
var path = require('path');
var nock = require('nock');
var helpers = require('yeoman-generator').test;

function mockGitHub() {
  nock.disableNetConnect();

  nock('https://api.github.com')
    .get('/repos/google/web-starter-kit/releases')
    .reply(200, [{tag_name: 'v0.5.2'}]);

  nock('https://github.com')
    .filteringPath(/archive\/.*/, 'archive/zip')
    .get('/google/web-starter-kit/archive/zip')
    .replyWithFile(200, path.join(__dirname, 'data', 'wsk-0.5.2.zip'));

  nock('https://raw.githubusercontent.com')
    .get('/h5bp/server-configs-gae/master/app.yaml')
    .replyWithFile(200, path.join(__dirname, 'data', 'app.yaml'));
}

function runGenerator(answers, opts, callback) {
  answers = answers || {};
  answers.siteName = answers.siteName || 'Test site';
  answers.siteDescription = answers.siteDescription || 'Dummy desc';
  answers.siteUrl = answers.siteUrl || 'http://test.example.org';
  answers.layoutChoice = answers.layoutChoice || 'default';

  if (typeof opts === 'function') {
    callback = opts;
    opts = null;
  }
  opts = opts || {'skip-install': true, 'quiet': true};

  helpers.run(path.join( __dirname, '../app'))
    .inDir(path.join( __dirname, 'tmp'))
    .withOptions(opts)
    .withPrompt(answers)
    .on('end', function () {
      nock.cleanAll();
      nock.enableNetConnect();
      callback();
    });
}


module.exports = {
  mockGitHub: mockGitHub,
  runGenerator: runGenerator
};
