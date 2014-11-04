'use strict';

var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var prompt = require('./prompt');
var download = require('./download');


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
          self.prompts = answers;
          done();
        }
      });
    };

    this.log(yosay('Web Starter Kit generator'));
    promptUser();
  },

  configuring: function () {
    var done = this.async(),
        dest = this.destinationRoot(),
        log = this.log.write().info('Getting latest WSK release version ...');

    var downloadProgress = function (res) {
      res.on('data', function () { log.write('.') });
    };

    download({extract: true, strip: 1}, function(err, d, url, release) {
      if (err) {
        log.error(err);
        return;
      }
      log.info('Found release %s', release.tag_name)
         .info('Fetching %s ...', url)
         .info(chalk.yellow('This might take a few moments'));
      d.dest(dest).use(downloadProgress);
      d.run(function(err) {
        log.write();
        if (err) {
          log.error(err).write();
        } else {
          log.ok('Done').write();
        }
        done();
      });
    });
  },

  writing: {
    gulpfile: function () {
      // TODO: tasks related to gulpfile (server-config, deploy)
      var filename = 'gulpfile.js',
          gulpfile = this.dest.read(filename);

      if (this.prompts.siteUrl) {
        var repl = "$1url: '" + this.prompts.siteUrl + "'"
        gulpfile = gulpfile.replace(/(pagespeed(?:.|\s)+)url:[^,]+/m, repl);
      }

      this.dest.delete(filename);
      this.dest.write(filename, gulpfile);
    },

    packagejson: function() {
      var filename = 'package.json',
          pkg = this.dest.readJSON(filename);

      pkg.name = this.prompts.siteName || 'replace me';
      pkg.version = '0.0.0';
      pkg.description = this.prompts.siteDescription;
      pkg.homepage = this.siteUrl;
      pkg.main = 'app/index.html';
      delete pkg.devDependencies['apache-server-configs'];

      this.dest.delete(filename);
      this.dest.write(filename, JSON.stringify(pkg, null, 2));
    },

    layout: function () {
      var basic = path.join('app', 'basic.html'),
          index = path.join('app', 'index.html'),
          content;

      // Layout
      if (this.prompts.layoutChoice === 'default') {
        content = this.dest.read(index);
      } else if (this.prompts.layoutChoice === 'ie8') {
        content = this.dest.read(basic);
      }

      this.dest.delete(basic);
      this.dest.delete(index);

      // Google Analytics
      if (this.prompts.gaTrackId) {
        content = content.replace(/UA-XXXXX-X/g, this.prompts.gaTrackId);
      }

      // Site name and description
      if (this.prompts.siteName) {
        var repl = '$1' + this.prompts.siteName + '$2';
        content = content.replace(/(<title>).*(<\/title>)/, repl);
      }
      if (this.prompts.siteDescription) {
        var repl = '$1' + this.prompts.siteDescription + '$2';
        content = content.replace(/(<meta\s+name=["']description["']\s+content=["']).*(["'])/, repl);
      }

      this.dest.write(index, content);
    }
  },

  end: function () {
    //this.installDependencies();
  }
});


module.exports = MobileGenerator;
