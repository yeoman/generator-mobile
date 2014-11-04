'use strict';

var exec = require('child_process').exec;
var path = require('path');
var assert = require('yeoman-generator').assert;
var testUtil = require('./util');

describe('mobile:app - GAE hosting', function () {
  var answers = {
    hostingChoice: 'gae',
    gcloudProjectId: 'my-cloud-project'
  };

  before(function (done) {
    testUtil.mockGitHub();
    testUtil.runGenerator(answers, done);
  });

  it('configures gcloud', function () {
    assert.file('.gcloud/properties');

    var prop = '^\s*project\\s+=\\s+' + answers.gcloudProjectId + '$';
    assert.fileContent('.gcloud/properties', new RegExp(prop, 'm'));
  });

  it('creates app.yaml server config', function () {
    assert.fileContent('gulpfile.js', /['"]app\/app\.yaml['"]/);
    assert.fileContent('app/app.yaml', /^application:\s+my-cloud-project$/m);
  });

  it('has "gulp deploy" task', function () {
    assert.fileContent('tasks/deploy.js', /gulp\.task\('deploy'/);
  });

});
