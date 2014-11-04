'use strict';

var exec = require('child_process').exec;
var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var prompt = require('./prompt');
var download = require('./download');
var hosting = require('./hosting');


var MobileGenerator = module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skip welcome message',
      type: Boolean,
      defaults: false
    });
    this.skipWelcome = this.options['skip-welcome-message'];

    this.option('skip-install', {
      desc: "Do not install dependencies",
      type: Boolean,
      defaults: false
    });
    this.skipInstall = this.options['skip-install'];

    this.option('quiet', {
      desc: 'Be quiet; only errors will be shown',
      type: Boolean,
      defaults: false
    })
    this.quiet = this.options['quiet'];
    this.verbose = !this.quiet;

    // load package
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

    if (this.verbose && !this.skipWelcome) {
      this.log(yosay('Web Starter Kit generator'));
    }

    promptUser();
  },

  configuring: function () {
    var done = this.async(),
        dest = this.destinationRoot(),
        log = this.log,
        verbose = this.verbose;

    verbose && log.write().info('Getting latest WSK release version ...');

    download({extract: true, strip: 1}, function(err, d, url, release) {
      if (err) {
        log.error(err);
        return;
      }

      verbose && log.info('Found release %s', release.tag_name)
         .info('Fetching %s ...', url)
         .info(chalk.yellow('This might take a few moments'));

      d.dest(dest);
      verbose && d.use(function(res) {
        res.on('data', function () { log.write('.') });
      });

      d.run(function(err) {
        if (err) {
          log.write().error(err).write();
        } else {
          verbose && log.write().ok('Done').write();
        }
        done();
      });

    });
  },

  writing: {
    gulpfile: function () {
      this.verbose && this.log.info('Configuring gulpfile.js');

      var filepath = path.join(this.destinationRoot(), 'gulpfile.js'),
          gulpfile = this.readFileAsString(filepath);

      // pagespeed
      if (this.prompts.siteUrl) {
        var repl = "$1url: '" + this.prompts.siteUrl + "'"
        gulpfile = gulpfile.replace(/(pagespeed(?:.|\s)+)url:[^,]+/m, repl);
      }

      // server-config
      var cfg = hosting.config(this.prompts.hostingChoice);
      if (cfg) {
        gulpfile = gulpfile.replace(/['"].*apache-server-configs.*['"]/m, "'" + cfg.filename + "'");
      } else {
        gulpfile = gulpfile.replace(/^.*apache-server-configs.*$/m, '');
      }

      // gulp deploy task
      var deployfile = hosting.deployTaskFilename(this.hostingChoice, this.deployChoice);
      if (deployfile) {
        gulpfile += '\n\n' + this.engine(this.read(deployfile), this.prompts);
      }

      this.writeFileFromString(gulpfile, filepath);
    },

    serverconfig: function() {
      if (!hosting.isSupported(this.prompts.hostingChoice))
        return;

      var done = this.async();
      this.verbose && this.log.info('Fetching server config');
      hosting.fetchConfig(this.prompts.hostingChoice, function(err, cfg, content) {
        if (!err) {
          // TODO: adjust Project ID if it is GAE
          this.dest.write(path.join('app', cfg.filename), content);
        } else {
          this.log.error(err);
        }
        done();
      }.bind(this));
    },

    // git: function() {
    //   var log = !this.quiet && this.log,
    //       done = this.async();
    //   exec('git --version', function (err) {
    //     if (err) {
    //       // TODO: remember to notify user and describe manual steps
    //       done();
    //       return;
    //     }
    //     // TODO: add dist/ if needed (hostingChoice)
    //     exec('git init && git add . && git commit -m "Initial import"', function (err, stdout) {
    //       log && log.write().info(stdout);
    //       done();
    //     });
    //   }.bind(this));
    // },

    packagejson: function() {
      this.verbose && this.log.info('Configuring package.json');

      var filepath = path.join(this.destinationRoot(), 'package.json'),
          pkg = JSON.parse(this.readFileAsString(filepath));

      pkg.name = this.prompts.siteName || 'replace me';
      pkg.version = '0.0.0';
      pkg.description = this.prompts.siteDescription;
      pkg.homepage = this.prompts.siteUrl;
      pkg.main = 'app/index.html';
      delete pkg.devDependencies['apache-server-configs'];

      this.writeFileFromString(JSON.stringify(pkg, null, 2), filepath);
    },

    webmanifest: function() {
      this.verbose && this.log.info('Configuring manifest.webapp');

      var filepath = path.join(this.destinationRoot(), 'app', 'manifest.webapp'),
          manifest = JSON.parse(this.readFileAsString(filepath));

      manifest.name = this.prompts.siteName;
      manifest.description = this.prompts.siteDescription;
      manifest.locales = manifest.locales || {};
      manifest.locales.en = manifest.locales.en || {};
      manifest.locales.en.name = this.prompts.siteName;
      manifest.locales.en.description = this.prompts.siteDescription;

      this.writeFileFromString(JSON.stringify(manifest, null, 2), filepath);
    },

    layout: function () {
      this.verbose && this.log.info('Configuring layout and contents');

      var basic = path.join(this.destinationRoot(), 'app', 'basic.html'),
          index = path.join(this.destinationRoot(), 'app', 'index.html'),
          content;

      // Layout
      if (this.prompts.layoutChoice === 'default') {
        content = this.read(index);
      } else if (this.prompts.layoutChoice === 'ie8') {
        content = this.read(basic);
      }
      this.dest.delete(basic);

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

      this.writeFileFromString(content, index);
    }
  },

  install: function () {
    if (!this.skipInstall) {
      this.verbose && this.log.write()
        .info("I'm all done. Running " + chalk.yellow('npm install') +
              " for you to install the required dependencies. " +
              "If this fails, try running the command yourself.")
        .info(chalk.yellow('This might take a few moments'))
        .write();
      this.npmInstall();
    }
  }
});
