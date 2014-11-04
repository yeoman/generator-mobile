'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var nock = require('nock');

describe('mobile:app', function () {

  describe('default layout, no hosting', function () {

    var answers = {
      siteName: 'Test site',
      siteDescription: 'Dummy description',
      siteUrl: 'http://test.example.org',
      layoutChoice: 'default',
      gaTrackId: 'UA-12345-6',
      hostingCat: 'none'
    };

    before(function (done) {
      nock.disableNetConnect();

      nock('https://api.github.com')
        .get('/repos/google/web-starter-kit/releases')
        .reply(200, [{tag_name: 'v2.5.2'}]);

      nock('https://github.com')
        .filteringPath(/archive\/.*/, 'archive/zip')
        .get('/google/web-starter-kit/archive/zip')
        .replyWithFile(200, path.join(__dirname, 'data', 'wsk-0.5.2.zip'));

      helpers.run(path.join( __dirname, '../app'))
        .inDir(path.join( __dirname, 'tmp'))
        .withOptions({'skip-install': true, 'quiet': true})
        .withPrompt(answers)
        .on('end', function () {
          nock.cleanAll()
          nock.enableNetConnect()
          done();
        });
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
              answers.siteDescription + '["\']';
      assert.fileContent('app/index.html', new RegExp(r, 'm'));
    });

    it('sets site name in index.html', function () {
      var r = '<title>' + answers.siteName + '</title>';
      assert.fileContent('app/index.html', new RegExp(r, 'm'));
    });

    it('configures Google Analytics', function () {
      var r = "ga\\('create', '" + answers.gaTrackId + "'";
      assert.fileContent('app/index.html', new RegExp(r, 'm'));
    });

    it('configures package.json', function () {
      var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.equal(pkg.name, answers.siteName);
      assert.equal(pkg.description, answers.siteDescription);
      assert.equal(pkg.homepage, answers.siteUrl);
      assert.equal(pkg.version, '0.0.0');
      assert.equal(pkg.main, 'app/index.html');
      assert.ok(!('apache-server-configs' in pkg.devDependencies),
        'found ' + pkg.devDependencies['apache-server-configs'] + 'in package.json');
    });

    it('configures manifest.webapp', function () {
      var manifest = JSON.parse(fs.readFileSync('app/manifest.webapp', 'utf8'));
      assert.equal(manifest.name, answers.siteName);
      assert.equal(manifest.description, answers.siteDescription);
      assert.equal(manifest.locales.en.name, answers.siteName);
      assert.equal(manifest.locales.en.description, answers.siteDescription);
    });

    it('configures pagespeed', function () {
      var r = 'pagespeed(?:.|\\s)+url:\\s*["\']' + answers.siteUrl + '["\']';
      assert.fileContent('gulpfile.js', new RegExp(r, 'm'));
    });

    it('does not have a server config', function () {
      assert.noFileContent('gulpfile.js', /['"].*apache-server-configs.*['"]/);
      assert.noFileContent('gulpfile.js', /htaccess/);
      assert.noFileContent('gulpfile.js', /nginx/);
      assert.noFileContent('gulpfile.js', /app\.yaml/);
    });

    it("does not have a deploy task", function () {
      assert.noFileContent('gulpfile.js', /gulp.task\('deploy/);
      assert.noFile('dist/.git');
    });

    it('keeps "dist" in .gitignore', function () {
      assert.fileContent('.gitignore', /^dist\/?$/m);
    });

    if (/^win/.test(process.platform)) {
      xit('initializes local git repo (skip on Windows)');
    } else {
      xit('initializes local git repo', function (done) {
        exec('git status', function (err, stdout, stderr) {
          assert.ok(!err, err && err.toString());
          assert.ok(/working directory clean/.test(stdout), stdout + stderr);
          done();
        });
      });
    }

  });
});
