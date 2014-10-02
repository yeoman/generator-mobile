/*global describe, beforeEach, it*/

var path    = require('path');
var helpers = require('yeoman-generator').test;
var assert  = require('assert');

describe('mobile generator test', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.mobile = helpers.createGenerator('mobile:app', [
        '../../app', [
          helpers.createDummyGenerator(),
          'mocha:app'
        ]
      ]);
      done();
    }.bind(this));
  });

  function run(mockPromptOptions, callback) {
    return function (done) {
      this.mobile.options['skip-install'] = true;

      helpers.mockPrompt(this.mobile, mockPromptOptions);

      this.mobile.run({}, function () {
        if (callback) {
          return callback(done);
        } else {
          done();
        }
      });
    };
  }

  function runAndAssertCreatedFiles(mockPromptOptions, expected) {
    return run(mockPromptOptions, function (done) {
      assert.file(expected);
      done();
    });
  }

  function runAndAssertFileContent(mockPromptOptions, expected) {
    return run(mockPromptOptions, function (done) {
      assert.fileContent(expected);
      done();
    });
  }

  function runAndAssertNoFileContent(mockPromptOptions, expected) {
    return run(mockPromptOptions, function (done) {
      assert.noFileContent(expected);
      done();
    });
  }

  it('the generator can be required without throwing', function () {
    // not testing the actual run of generators yet
    this.app = require('../app');
  });

  describe('frameworks', function () {

    describe('Bootstrap', function () {
      var mockPromptOptions = {
        frameworkChoice: 'bootstrap'
      };

      it('adds `bootstrap` as a Bower dependency', runAndAssertFileContent(mockPromptOptions, [
        [ 'bower.json', /"bootstrap"/ ]
      ]));
    });

    describe('Foundation', function () {
      var mockPromptOptions = {
        frameworkChoice: 'foundation'
      };

      it('adds `foundation` as a Bower dependency', runAndAssertFileContent(mockPromptOptions, [
        [ 'bower.json', /"foundation"/ ]
      ]));
    });

    describe('PureCSS', function () {
      var mockPromptOptions = {
        frameworkChoice: 'purecss'
      };

      it('adds `pure` as a Bower dependency', runAndAssertFileContent(mockPromptOptions, [
        [ 'bower.json', /"pure"/ ]
      ]));
    });

    describe('Topcoat', function () {
      var mockPromptOptions = {
        frameworkChoice: 'topcoat'
      };

      it('adds `topcoat` as a Bower dependency', runAndAssertFileContent(mockPromptOptions, [
        [ 'bower.json', /"topcoat"/ ]
      ]));
    });
  });

  describe('layout boilerplate', function () {
    var expected = {
      bootstrap: [
        'app/scripts/application.js',
        'app/scripts/holder.js'
      ],

      purecss: [
        'app/styles/marketing.css'
      ]
    };

    it('creates Bootstrap files', runAndAssertCreatedFiles({
      frameworkChoice: 'bootstrap',
      layoutChoice: true
    }, expected.bootstrap));

    it('creates PureCSS files', runAndAssertCreatedFiles({
      frameworkChoice: 'purecss',
      layoutChoice: true
    }, expected.purecss));
  });

  describe('responsive images', function () {
    it('adds `grunt-responsive-images` task', runAndAssertFileContent({
      frameworkChoice: 'noframework',
      responsiveImages: true
    }, [
      [ 'package.json', /"grunt-responsive-images"/ ]
    ]));
  });

  describe('remove click delays', function () {
    it('adds fastclick as a bower dependency', runAndAssertFileContent({
      frameworkChoice: 'noframework',
      fastclickChoice: true
    }, [
      [ 'bower.json', /"fastclick"/ ]
    ]));

    it('attaches FastClick to the document body', runAndAssertFileContent({
      frameworkChoice: 'noframework',
      fastclickChoice: true
    }, [
      [ 'app/scripts/main.js', /FastClick\.attach\(document\.body\);/ ]
    ]));

    it('appends fastclick script to index.html', runAndAssertFileContent({
      frameworkChoice: 'noframework',
      fastclickChoice: true
    }, [
      [ 'app/index.html', /<!-- build:js scripts\/fastclick.js -->/ ]
    ]));

    describe('when using RequireJS', function () {
      var mockPromptOptions = {
        frameworkChoice: 'noframework',
        fastclickChoice: true,
        includeRequireJS: true
      };

      it('does not append fastclick script to index.html', runAndAssertNoFileContent(mockPromptOptions, [
          [ 'app/index.html', /<!-- build:js scripts\/fastclick.js -->/ ]
      ]));

      it('lazy loads fastclick script', runAndAssertFileContent(mockPromptOptions, [
      [ 'app/scripts/main.js', /fastclick: '..\/bower_components\/fastclick\/lib\/fastclick'/ ],
      [ 'app/scripts/main.js', /FastClick\.attach\(document\.body\);/ ]
      ]));
    });
  });

  describe('screenshots', function () {
    var mockPromptOptions = {
      frameworkChoice: 'noframework',
      screenshots: true
    };

    it('adds `grunt-autoshot` task', runAndAssertFileContent(mockPromptOptions, [
      [ 'package.json', /"grunt-autoshot"/ ]
    ]));

    it('configures `grunt-autoshot` task', runAndAssertFileContent(mockPromptOptions, [
      [ 'Gruntfile.js', /autoshot: {/ ],
      [ 'Gruntfile.js', /grunt\.registerTask\('screenshots'/ ]
    ]));
  });

  describe('BrowserStack', function () {
    it('creates additional grunt `open` tasks', runAndAssertFileContent({
      frameworkChoice: 'noframework',
      browserstack: true
    }, [
      [ 'Gruntfile.js', /open:(\r|\n|.)*nexus4/ ],
      [ 'Gruntfile.js', /open:(\r|\n|.)*nexus7/ ],
      [ 'Gruntfile.js', /open:(\r|\n|.)*iphone5/ ]
    ]));
  });

  describe('RequireJS', function () {
    var mockPromptOptions = {
      frameworkChoice: 'noframework',
      includeRequireJS: true
    };

    it('includes data-main script in index.html', runAndAssertFileContent(mockPromptOptions, [
      [ 'app/index.html', /data-main="scripts\/main"/ ]
    ]));

    it('uses require.config', runAndAssertFileContent(mockPromptOptions, [
      [ 'app/scripts/main.js', /require\.config/ ]
    ]));

    it('adds `grunt-bower-requirejs` task', runAndAssertFileContent(mockPromptOptions, [
      [ 'package.json', /"grunt-bower-requirejs"/ ]
    ]));

    it('adds `requirejs` as a Bower dependency', runAndAssertFileContent(mockPromptOptions, [
      [ 'bower.json', /"requirejs"/ ]
    ]));

    it('configures `grunt-bower-requirejs` tasks', runAndAssertFileContent(mockPromptOptions, [
      [ 'Gruntfile.js', /requirejs: {/ ],
      [ 'Gruntfile.js', /bower: {/ ]
    ]));
  });

  /*
    This feature doesn't appear to be implemented yet.
    describe('WebP', function () {
      var mockPromptOptions = {
        frameworkChoice: 'noframework',
        webpSupport: true
      };
    });
  */

  describe('async localStorage polyfill', function () {
    it('creates expected files', runAndAssertCreatedFiles({
      frameworkChoice: 'noframework',
      asyncLocalStorage: true
    }, [
      'app/scripts/async.localStorage.js',
      'app/scripts/async.localStorage.examples.js'
    ]));
  });

  describe('Fullscreen API', function () {
    it('creates expected files', runAndAssertCreatedFiles({
      frameworkChoice: 'noframework',
      fullscreenAPI: true
    }, [
      'app/scripts/fullscreensnippet.js'
    ]));
  });

  describe('Modernizr task', function () {
    var mockPromptOptions = {
      frameworkChoice: 'noframework',
      modernizrTask: true
    };

    it('adds `grunt-modernizr` task', runAndAssertFileContent(mockPromptOptions, [
      [ 'package.json', /"grunt-modernizr"/ ]
    ]));

    it('configures `grunt-modernizr` task', runAndAssertFileContent(mockPromptOptions, [
      [ 'Gruntfile.js', /modernizr: {/ ]
    ]));
  });
});
