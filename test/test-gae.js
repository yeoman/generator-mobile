/*global describe, before, it*/
'use strict';
var assert = require('yeoman-generator').assert;
var testUtil = require('./util');

describe('mobile:app - GAE hosting', function () {
  this.timeout(7000);

  before(function (done) {
    testUtil.mockGitHub();
    testUtil.runGenerator({
      hostingChoice: 'gae',
      gcloudProjectId: 'my-cloud-project'
    }, done);
  });

  it('configures gcloud', function () {
    assert.file('.gcloud/properties');

    var prop = '^project\\s+=\\s+my-cloud-project$';
    assert.fileContent('.gcloud/properties', new RegExp(prop, 'm'));
  });

  it('creates app.yaml server config', function () {
    assert.fileContent('gulpfile.js', /['"]app\/app\.yaml['"]/);
    assert.fileContent('app/app.yaml', /^application:\s+my-cloud-project$/m);
  });

  it('has "gulp deploy" task', function () {
    assert.fileContent('tasks/deploy.js', /gulp\.task\('deploy'/);
    assert.fileContent('tasks/deploy.js', /'app', 'deploy', 'dist'/);
  });

});
