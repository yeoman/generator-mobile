/*global describe, beforeEach, it*/
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
