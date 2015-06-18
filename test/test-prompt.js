/*global describe, before, it*/
'use strict';
var assert = require('yeoman-generator').assert;
var prompt = require('../app/prompt');

describe('prompts module', function () {
  it('extracts domain from url', function () {
    assert.equal(prompt.extractDomain('http://www.example.org'), 'www.example.org');
    assert.equal(prompt.extractDomain('https://www.example.org'), 'www.example.org');
    assert.equal(prompt.extractDomain('https://www.example.org/some/path'), 'www.example.org');
    assert.equal(prompt.extractDomain('http://www.example.org:1234/some/path'), 'www.example.org:1234');
    assert.equal(prompt.extractDomain('example.org'), 'example.org');
    assert.equal(prompt.extractDomain('example.org/some/page'), 'example.org');
  });

  it('recognizes GitHub domain', function () {
    assert(prompt.isGitHub('http://example.github.io'), 'http://example.github.io');
    assert(prompt.isGitHub('https://example.github.io'), 'https://example.github.io');
    assert(prompt.isGitHub('http://owner.github.io/project'), 'http://owner.github.io/project');
    assert(!prompt.isGitHub('http://www.example.org'), 'http://www.example.org');
  });

  describe('githubTarget', function () {
    var ghTarget;

    before(function () {
      for (var i = 0, qq = prompt.questions(), q; (q = qq[i]); i++) {
        if (q.name === 'githubTarget') {
          ghTarget = q;
          break;
        }
      }

      if (!ghTarget) {
        assert.fail('Could not find "githubTarget" question');
      }
    });

    it('validates input', function () {
      assert.equal(ghTarget.validate('owner/repo'), true, 'owner/repo');
      assert.equal(ghTarget.validate('owner/www.example.org'), true, 'owner/repo');
      assert.equal(ghTarget.validate('owner/owner.github.io'), true, 'owner/repo');
      assert.equal(ghTarget.validate('owner'), true, 'owner');
      assert.equal(typeof ghTarget.validate('in.val.id'), 'string', 'in.val.id');
    });

    it('filters input', function () {
      assert.equal(ghTarget.filter('owner/repo'), 'owner/repo');
      assert.equal(ghTarget.filter('"owner/repo"'), 'owner/repo');
      assert.equal(ghTarget.filter('\'owner/repo\''), 'owner/repo');
      assert.equal(ghTarget.filter(''), '');
      assert.equal(ghTarget.filter(null), '');
      assert.equal(ghTarget.filter(undefined), '');
    });

    it('knows when to ask the question', function () {
      assert.equal(ghTarget.when({hostingChoice: 'gae'}), false);
      assert.equal(ghTarget.when({hostingChoice: null}), false);
      assert.equal(ghTarget.when({hostingChoice: 'github'}), true);
    });

    it('infers default value from github.io siteUrl', function () {
      assert.equal(ghTarget.default({siteUrl: 'http://owner.github.io/repo'}),
        'owner/repo');
      assert.equal(ghTarget.default({siteUrl: 'http://owner.github.io'}),
        'owner/owner.github.io');
    });
  });

  describe('populateMissing', function () {
    it('infers githubTarget from siteUrl', function () {
      var a = {siteUrl: 'https://owner.github.io'};
      prompt.populateMissing(a);
      assert.equal(a.githubTarget, 'owner/owner.github.io');

      a = {siteUrl: 'https://owner.github.io/repo'};
      prompt.populateMissing(a);
      assert.equal(a.githubTarget, 'owner/repo');
    });

    it('infers siteUrl from githubTarget', function () {
      var a = {githubTarget: 'owner/repo'};
      prompt.populateMissing(a);
      assert.equal(a.siteUrl, 'https://owner.github.io/repo');

      a = {githubTarget: 'owner/owner.github.io'};
      prompt.populateMissing(a);
      assert.equal(a.siteUrl, 'https://owner.github.io');
    });

    it('infers siteHost from siteUrl', function () {
      var a = {siteUrl: 'http://www.example.org/path'};
      prompt.populateMissing(a);
      assert.equal(a.siteHost, 'www.example.org');
    });

    it('infers githubBranch', function () {
      var a = {siteUrl: 'http://owner.github.io'};
      prompt.populateMissing(a);
      assert.equal(a.githubBranch, 'master');

      a = {siteUrl: 'http://owner.github.io/repo'};
      prompt.populateMissing(a);
      assert.equal(a.githubBranch, 'gh-pages');

      a = {githubTarget: 'owner/repo'};
      prompt.populateMissing(a);
      assert.equal(a.githubBranch, 'gh-pages');

      a = {githubTarget: 'owner/owner.github.io'};
      prompt.populateMissing(a);
      assert.equal(a.githubBranch, 'master');

      a = {siteUrl: 'http://www.example.org/path'};
      prompt.populateMissing(a);
      assert.equal(a.githubBranch, undefined);
    });
  });
});
