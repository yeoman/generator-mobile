'use strict';

var util = require('util');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var prompt = require('./prompt');
var downloader = require('./download');


var MobileGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async(),
        self = this;

    var promptUser = function(defaults) {
      self.prompt(prompt.questions(defaults), function (answers) {
        if (!answers.confirmed) {
          promptUser(answers);
        } else {
          delete answers['confirmed'];
          self.opts = answers;
          done();
        }
      });
    };

    this.log(yosay('Web Starter Kit generator'));
    promptUser();
  },

  writing: {
    app: function () {
      var dest = this.destinationRoot();

      var log = this.log.write()
        .info('Getting latest WSK release version ...');

      var downloadProgress = function (res) {
        res.on('data', function () { log.write('.') });
      };

      downloader({extract: true, strip: 1}, function(d, url, release) {
        log.info('Found release %s', release.tag_name)
           .info('Fetching %s ...', url)
           .info(chalk.yellow('This might take a few moments'));
        d.dest(dest).use(downloadProgress);
        d.run(function(err) {
          if (err) {
            log.write().error(err).write();
            return;
          }
          log.write().ok('Done').write();
        });
      });
    },

    projectfiles: function () {
      // this.src.copy('editorconfig', '.editorconfig');
      // this.src.copy('jshintrc', '.jshintrc');
    }
  },

  end: function () {
    //this.installDependencies();
  }
});


module.exports = MobileGenerator;
