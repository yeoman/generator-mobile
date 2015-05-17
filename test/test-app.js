/*global describe, before, it*/
'use strict';
var fs = require('fs');
var assert = require('yeoman-generator').assert;
var testUtil = require('./util');

describe('mobile:app', function () {

  describe('default layout, no hosting', function () {

    before(function (done) {
      testUtil.mockGitHub();
      testUtil.runGenerator({
        siteName: 'Test site',
        siteDescription: 'Dummy description',
        siteUrl: 'http://test.example.org',
        layoutChoice: 'default',
        gaTrackId: 'UA-12345-6',
        hostingCat: 'none'
      }, done);
    });

    it('downloads and unpackes zipped wsk', function () {
      assert.file([
        '.gitignore',
        'package.json',
        'gulpfile.js',
        'app/manifest.webapp',
        'app/index.html',
        'app/styleguide.html',
        'app/styles/main.scss'
      ]);
    });

    it('removes basic.html', function () {
      assert.noFile('app/basic.html');
    });

    it('sets site description in index.html', function () {
      var r = '<meta\\s+name=["\']description["\']\\s+content=["\']' +
              'Dummy description["\']';
      assert.fileContent('app/index.html', new RegExp(r, 'm'));
    });

    it('sets site name in index.html', function () {
      var t = '<title>Test site</title>';
      assert.fileContent('app/index.html', new RegExp(t, 'm'));
    });

    it('configures Google Analytics', function () {
      /*jshint quotmark:false */
      var r = "ga\\('create', 'UA-12345-6'";
      /*jshint quotmark:single */
      assert.fileContent('app/index.html', new RegExp(r, 'm'));
    });

    it('configures package.json', function () {
      var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.equal(pkg.name, 'Test-site');
      assert.equal(pkg.description, 'Dummy description');
      assert.equal(pkg.homepage, 'http://test.example.org');
      assert.equal(pkg.version, '0.0.0');
      assert.equal(pkg.main, 'app/index.html');
      assert.ok(!('apache-server-configs' in pkg.devDependencies),
        'found ' + pkg.devDependencies['apache-server-configs'] + 'in package.json');
    });

    it('configures manifest.webapp', function () {
      var manifest = JSON.parse(fs.readFileSync('app/manifest.webapp', 'utf8'));
      assert.equal(manifest.name, 'Test site');
      assert.equal(manifest.description, 'Dummy description');
      assert.equal(manifest.locales.en.name, 'Test site');
      assert.equal(manifest.locales.en.description, 'Dummy description');
    });

    it('configures pagespeed', function () {
      var r = 'pagespeed(?:.|\\s)+url:\\s*["\']http://test.example.org["\']';
      assert.fileContent('gulpfile.js', new RegExp(r, 'm'));
    });

    it('does not have a server config', function () {
      assert.noFileContent('gulpfile.js', /['"].*apache-server-configs.*['"]/);
      assert.noFileContent('gulpfile.js', /htaccess/);
      assert.noFileContent('gulpfile.js', /nginx/);
      assert.noFileContent('gulpfile.js', /app\.yaml/);
    });

    it('does not have a deploy task', function () {
      assert.noFileContent('gulpfile.js', /gulp.task\('deploy/);
      assert.noFile('dist/.git');
    });

    it('keeps "dist" in .gitignore', function () {
      assert.fileContent('.gitignore', /^dist\/?$/m);
    });

    // TODO: remove on the next WSK release
    it('temporary replaces "clean" task', function () {
      /*jshint quotmark:false */
      var t = "^gulp\\.task\\('clean', del\\.bind\\(null, \\['\\.tmp', 'dist/\\*', '!dist/\\.git'\\]\\)\\);$";
      /*jshint quotmark:true */
      assert.fileContent('gulpfile.js', new RegExp(t, 'm'));
    });

  });
});
