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
});
