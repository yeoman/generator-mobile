/*global describe, beforeEach, it*/
'use strict';

var assert = require('yeoman-generator').assert;
var nock = require('nock');
var download = require('../app/download');

describe('download module', function() {

  afterEach(function () {
    nock.cleanAll();
  })

  it('fetches latest release version and creates downloader', function(done) {
    var scope = nock('https://api.github.com')
      .get('/repos/google/web-starter-kit/releases')
      .reply(200, [
        {tag_name: 'v1'},
        {tag_name: 'v2'},
        {tag_name: 'v2.5.2'}
      ]);

    download({}, function(err, d, url, ver) {
      assert(!err, err);
      assert.deepEqual(ver, {tag_name: 'v2.5.2'});
      assert.equal(url, download.WSK_ZIP_URL + 'v2.5.2.zip');
      assert(d);

      if (!scope.isDone()) {
        assert.fail('pending mocks: ' + scope.pendingMocks());
      }
      done();
    });
  });

  it('handles GitHub releases request failure', function(done) {
    nock('https://api.github.com')
      .get('/repos/google/web-starter-kit/releases')
      .reply(400, 'bad request');

    download({}, function(err) {
      assert(err);
      assert.equal(err.toString(), 'Error: bad request');
      done();
    });
  });
});
