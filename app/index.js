'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var prompt = require('./prompt');
var download = require('./download');
var hosting = require('./hosting');
var deps = require('./deps');


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

    // info/error/warning messages during the generation process
    this.messages = [];

    // dependencies checks;
    this.checks = {};
  },

  prompting: function () {
    var self = this,
        done = this.async();

    var promptUser = function (defaults) {
      self.prompt(prompt.questions(defaults), function (answers) {
        prompt.populateMissing(answers);
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
    var self = this,
        done = this.async();

    this.verbose && this.log.write().info('Getting latest WSK release version ...');

    download({extract: true, strip: 1}, function (err, downloader, url, ver) {
      if (err) {
        self.log.error(err);
        process.exit(1);
      }

      if (self.verbose) {
        self.log.info('Found release %s', ver.tag_name)
           .info('Fetching %s ...', url)
           .info(chalk.yellow('This might take a few moments'));
        downloader.use(function (res) {
          res.on('data', function () { self.log.write('.') }) ;
        });
      }

      downloader.dest(self.destinationRoot()).run(function (err) {
        if (err) {
          self.log.write().error(err).write();
          process.exit(1);
        }

        if (self.verbose) {
          self.log.write().ok('Done').info('Checking dependencies ...');
        }

        var checks = deps.checkAll(self.prompts);
        checks.on('done', done);

        checks.on('passed', function (res) {
          self.checks[res.what] = {data: res.data};
          self.verbose && self.log.ok(res.what + ' ' + (res.result || ''));
        });

        checks.on('failed', function (res) {
          self.checks[res.what] = {data: res.data, error: res.error};
          self.messages.push(res.error.message);
          self.log.error(res.error.message);
        });
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
        gulpfile = gulpfile.replace(/['"].*apache-server-configs.*['"]/m, "'app/" + cfg.filename + "'");
      } else {
        gulpfile = gulpfile.replace(/^.*apache-server-configs.*$/m, '');
      }

      // TODO: remove this and the corresponding test on the next WSK release
      gulpfile = gulpfile.replace(
        /^gulp\.task\('clean', del\.bind\(null, \['\.tmp', 'dist'\]\)\);$/m,
        "gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git']));");

      this.writeFileFromString(gulpfile, filepath);
    },

    // serverconfig: function () {
    //   if (!hosting.isSupported(this.prompts.hostingChoice))
    //     return;

    //   this.verbose && this.log.info('Fetching server config');

    //   var done = this.async();
    //   hosting.fetchConfig(this.prompts.hostingChoice, function (err, cfg, content) {
    //     if (!err) {
    //       // TODO: adjust Project ID if it is GAE
    //       this.dest.write(path.join('app', cfg.filename), content);
    //     } else {
    //       this.log.error(err);
    //     }
    //     done();
    //   }.bind(this));
    // },

    packagejson: function () {
      this.verbose && this.log.info('Configuring package.json');

      var filepath = path.join(this.destinationRoot(), 'package.json'),
          pkg = JSON.parse(this.readFileAsString(filepath));

      pkg.name = (this.prompts.siteName || 'replace me')
        .replace(/[^0-9a-z_\-]/ig, '-')
        .replace(/-+/g, '-');
      pkg.version = '0.0.0';
      pkg.description = this.prompts.siteDescription;
      pkg.homepage = this.prompts.siteUrl;
      pkg.main = 'app/index.html';
      delete pkg.devDependencies['apache-server-configs'];

      this.writeFileFromString(JSON.stringify(pkg, null, 2), filepath);
    },

    webmanifest: function () {
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
    },

    // --------------------- hosting / deployment tasks ---------------------

    gcloud: function () {
      if (this.prompts.hostingChoice !== 'gae')
        return;

      this.dest.mkdir('.gcloud');
      this.template('gcloud-properties', path.join('.gcloud', 'properties'));
      this.template('deploy_gae.js', path.join('tasks', 'deploy.js'));

      var done = this.async();
      hosting.fetchConfig('gae', function (err, cfg, content) {
        if (!err) {
          content = content.replace(/^(application:\s+).*$/m, '$1' + this.prompts.gcloudProjectId);
          this.dest.write(path.join('app', cfg.filename), content);
        } else {
          this.log.error(err);
        }
        done();
      }.bind(this));
    },

    github: function () {
      if (this.prompts.hostingChoice !== 'github')
        return;

      this.dest.mkdir('dist');
      this.template('deploy_github.js', path.join('tasks', 'deploy.js'));
      if (this.prompts.siteHost && !prompt.isGitHub(this.prompts.siteHost)) {
        this.dest.write(path.join('app', 'CNAME'), this.prompts.siteHost);
      }

      if (this.checks.git.error)
        return;

      var log = !this.quiet && this.log,
          done = this.async();

      var cmd = [
        'git init .',
        'git checkout -b ' + this.prompts.githubBranch,
        'git commit --allow-empty -m "Initial empty commit"',
        'git remote add origin git@github.com:' + this.prompts.githubTarget
      ];
      exec(cmd.join(' && '), {cwd: path.join('dist')}, function (err, stdout) {
        log && log.write().info(stdout);
        done();
      });
    }

  },

  install: {
    npminstall: function () {
      if (!this.skipInstall) {
        this.verbose && this.log.write()
          .info("Running " + chalk.yellow('npm install') + " " +
                "to install the required dependencies. " +
                "If this fails, try running the command yourself.")
          .info(chalk.yellow('This might take a few moments'))
          .write();
        this.npmInstall();
      }
    },

    git: function () {
      if (!this.checks.git || this.checks.git.error)
        return;

      var self = this, done = this.async(),
          cmd = ['git init', 'git add .'],
          gitignore = this.readFileAsString('.gitignore');

      try {
        // test whether we have dist/ subrepo
        fs.statSync(path.join(this.destinationRoot(), 'dist', '.git'));
        // add it properly
        cmd.push('git reset -- dist', 'git add dist/');
        // exclude it from the .gitignore
        gitignore = gitignore.replace(/^dist\/?[\r\n]/m, '');
        this.writeFileFromString(gitignore, '.gitignore');
      } catch (err) {}

      cmd.push('git commit -m "Initial commit"');

      exec(cmd.join(' && '), function (err, stdout) {
        err && self.log.error()
        self.verbose && self.log.write().info(stdout);
        done();
      });
    }
  },

  end: function () {
    if (this.messages.length === 0) {
      this.verbose && this.log.write().ok('You are all set now. Happy coding!');
      return;
    }

    this.log.write().error('There were some errors during the process:').write();

    for (var i = 0, m; m = this.messages[i]; i++) {
      this.log.write((i + 1) + ' ' + m);
    }
  }
});
