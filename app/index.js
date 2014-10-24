'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var downloader = require('./download');


var MobileGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    this.log(yosay('Web Starter Kit generator'));

    // var prompts = [{
    //   type: 'confirm',
    //   name: 'someOption',
    //   message: 'Would you like to enable this option?',
    //   default: true
    // }];

    // this.prompt(prompts, function (props) {
    //   this.someOption = props.someOption;

    //   done();
    // }.bind(this));
    done();
  },

  writing: {
    app: function () {

      // var url = 'https://github.com/google/web-starter-kit/archive/v0.5.2.zip';
      var dest = this.destinationRoot(); // + '/test'

      var log = this.log.write()
        .info('Getting latest WSK release version ...');

      var downloadProgress = function (res) {
        res.on('data', function () { log.write('.') });
      };

      downloader({extract: true, strip: 1}, function(d, url, release) {
        log
          .info('Found release %s', release.tag_name)
          .info('Fetching %s ...', url)
          .info(chalk.yellow('This might take a few moments'));
        d.dest(dest).use(downloadProgress);
        d.run(function(err) {
          if (err) {
            log.write().error(err).write();
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
