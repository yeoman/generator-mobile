'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.mainCoffeeFile = 'console.log "\'Allo from CoffeeScript!"';
  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  console.log(this.yeoman);
  console.log('Out of the box I include HTML5 Boilerplate, jQuery and Modernizr.');

  var prompts = [
  {
    type: 'list',
    name: 'frameworkChoice',
    message: 'Would you like to include a mobile-first UI framework?',
    choices: [{
      name: 'No Framework',
      value: 'noframework'
    }, {
      name: 'Bootstrap',
      value: 'bootstrap'
    }, {
      name: 'PureCSS',
      value: 'pure'
    }, {
      name: 'TopCoat',
      value: 'topcoat'
    }, {
      name: 'Foundation',
      value: 'foundation'
    }]
  },{
    type: 'confirm',
    name: 'layoutChoice',
    message: 'Would you like to include layout boilerplate for your selection?',
    default: false
  }, {
    type: 'confirm',
    name: 'responsiveImages',
    message: 'Would you like to generate multi-resolution images for srcset?',
    default: false
  },{
    type: 'confirm',
    name: 'fastclickChoice',
    message: 'Would you like to remove click delays in touch UIs (eg iOS)?',
    default: false
  },{
    type:'confirm',
    name:'screenshots',
    message: 'Would you like screenshots of your site at various viewport sizes?',
    default: true
  },{
    type:'confirm',
    name:'browserstack',
    message: 'Would you like to use BrowserStack for device testing?',
    default: false
  },{
    type: 'confirm',
    name: 'includeRequireJS',
    message: 'Would you like to include RequireJS (for AMD support)?',
    default: true
  },{
    type: 'confirm',
    name: 'webpSupport',
    message: 'Would you like to convert your images to WebP?',
    default: false
  },{
    type: 'confirm',
    name: 'asyncLocalStorage',
    message: 'Would you like to include a polyfill for async localStorage?',
    default: false
  },{
    type: 'confirm',
    name: 'fullscreenAPI',
    message: 'Would you like to include boilerplate for the Fullscreen API?',
    default: false
  },{
    type: 'confirm',
    name: 'modernizrTask',
    message: 'Should builds only include Modernizr feature-detects you actually use?',
    default: false
  }];


  this.prompt(prompts, function (props) {
    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.includeRequireJS = props.includeRequireJS;
    this.screenshots = props.screenshots;
    this.frameworkSelected = getFrameworkChoice(props);
    this.layoutChoice = props.layoutChoice;
    this.fastclickChoice = props.fastclickChoice;
    this.asyncLocalStorage = props.asyncLocalStorage;
    this.fullscreenAPI = props.fullscreenAPI;
    this.browserstack =  props.browserstack;
    this.webpSupport = props.webpSupport;
    this.modernizrTask = props.modernizrTask;
    this.responsiveImages = props.responsiveImages;

    cb();
  }.bind(this));
};

function getFrameworkChoice(props) {
  var choices = props.frameworkChoice;

  if(choices.indexOf('bootstrap') !== -1) {
    return 'bootstrap';
  }

  if(choices.indexOf('pure') !== -1) {
    return 'pure';
  }

  if(choices.indexOf('topcoat') !== -1) {
    return 'topcoat';
  }

  if(choices.indexOf('foundation') !== -1) {
    return 'foundation';
  }

  if(choices.indexOf('noframework') !== -1) {
    return 'noframework';
  }
}

// ----------------------------------------------------------------
// Testing
// ----------------------------------------------------------------

AppGenerator.prototype.addScreenshots = function screenshots() {
  if(!this.screenshots) {
    return;
  }

  var devices = [
    {
      name: 'G1',
      width: 320,
      height: 480,
      density: 1
    }, {
      name: 'Nexus S',
      width: 480,
      height: 800,
      density: 1.5
    }, {
      name: 'Nexus 4',
      width: 768,
      height: 1280,
      density: 2
    }, {
      name: 'Nexus 7 Orig.',
      width: 800,
      height: 1280,
      density: 1.33
    }, {
      name: 'Nexus 7 2.0',
      width: 1200,
      height: 1920,
      density: 2
    }, {
      name: 'Xoom',
      width: 800,
      height: 1280,
      density: 1
    }, {
      name: 'Nexus 10',
      width: 1600,
      height: 2560,
      density: 2
    }, {
      name: 'iPhone 3GS',
      width: 320,
      height: 480,
      density: 1
    }, {
      name: 'iPhone 4 / 4S',
      width: 640,
      height: 960,
      density: 2
    }, {
      name: 'iPhone 5',
      width: 640,
      height: 1136,
      density: 2
    }, {
      name: 'iPad 1 & 2',
      width: 768,
      height: 1024,
      density: 1
    }, {
      name: 'iPad 3 & 4',
      width: 1536,
      height: 2048,
      density: 2
    }
  ];

  var skipList = {};
  this.viewports = '';
  for(var i = 0; i < devices.length; i++) {
    var device = devices[i];
    var width = Math.ceil(device.width / device.density);
    var height = Math.ceil(device.height / device.density);

    // Only width matters since screenshot is of full height
    var identifier = width;// +'x'+height;
    if(typeof skipList[identifier] !== 'undefined') {
      continue;
    }

    skipList[identifier] = {};

    if(i !== 0) {
      this.viewports += ',';
    }

    this.viewports += '\''+width+'x'+height+'\',';
    this.viewports += '\''+height+'x'+width+'\'';
  }

};


// ----------------------------------------------------------------
// Layouts
// ----------------------------------------------------------------

AppGenerator.prototype.addLayout = function gruntfile() {
  var layoutStr = "<!--yeoman-welcome-->";

  if(this.layoutChoice && this.frameworkSelected) {
    console.log(this.frameworkSelected +' was chosen');

    // a framework was chosen
    if(this.frameworkSelected == 'bootstrap'){
      this.copy('layouts/bootstrap/assets/js/application.js', 'app/scripts/application.js');
      this.copy('layouts/bootstrap/assets/js/holder/holder.js', 'app/scripts/holder.js');
      layoutStr = this.readFileAsString(path.join(this.sourceRoot(), 'layouts/bootstrap/index.html'));


    }else if(this.frameworkSelected == 'pure'){

      this.copy('layouts/pure/stylesheets/marketing.css', 'app/styles/marketing.css');
      this.indexFile = this.appendStyles(this.indexFile, 'styles/marketing.css', [
      'styles/marketing.css'
      ]);
      layoutStr = this.readFileAsString(path.join(this.sourceRoot(), 'layouts/pure/index.html'));

    }else if(this.frameworkSelected == 'topcoat'){

      layoutStr = this.readFileAsString(path.join(this.sourceRoot(), 'layouts/topcoat/index.html'));

    }else if(this.frameworkSelected == 'foundation'){

      layoutStr = this.readFileAsString(path.join(this.sourceRoot(), 'layouts/foundation/index.html'));
    }
  }

  // Replace the page logic comment with the layoutString
  this.indexFile = this.indexFile.replace("<!--your page logic-->", layoutStr);
};

// ----------------------------------------------------------------

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.fullscreen = function fullscreen() {
  if(this.fullscreenAPI){
    this.copy('fullscreensnippet.js', 'app/scripts/fullscreensnippet.js');
  }
};


AppGenerator.prototype.storage = function storage() {
  if(this.asyncLocalStorage){
    this.copy('async.localStorage.js', 'app/scripts/async.localStorage.js');
    this.copy('async.localStorage.examples.js', 'app/scripts/async.localStorage.examples.js');
  }

};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('favicon.ico', 'app/favicon.ico');
  this.copy('404.html', 'app/404.html');
  this.copy('robots.txt', 'app/robots.txt');
  this.copy('htaccess', 'app/.htaccess');
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  this.copy('main.css', 'app/styles/main.css');
};

// TODO(mklabs): to be put in a subgenerator like rjs:app
AppGenerator.prototype.requirejs = function requirejs() {
  if (this.includeRequireJS) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', ['bower_components/requirejs/require.js'], {
      'data-main': 'scripts/main'
    });

    // add a basic amd module
    this.write('app/scripts/app.js', [
      '/*global define */',
      'define([], function () {',
      '    \'use strict\';\n',
      '    return \'\\\'Allo \\\'Allo!\';',
      '});'
    ].join('\n'));
  }
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  // prepare default content text
  var defaults = ['HTML5 Boilerplate'];

  var titleClass = '';

  if(this.frameworkSelected == 'pure') {
    titleClass = 'splash-head';
  }

  var contentText = [
    '                <h1 class=\''+titleClass+'\'>\'Allo, \'Allo!</h1>',
    '                <p>You now have</p>',
    '                <ul>'
  ];

  if (!this.includeRequireJS) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', [
      'bower_components/jquery/jquery.js',
      'scripts/main.js'
    ]);

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/coffee.js',
      sourceFileList: ['scripts/hello.js'],
      searchPath: '.tmp'
    });
  }

  if(this.frameworkSelected == 'bootstrap') {
    // Add Bootstrap scripts
      this.indexFile = this.appendStyles(this.indexFile, 'styles/vendor/bootstrap.css', [
        'bower_components/bootstrap/dist/css/bootstrap.css'
      ]);

    defaults.push('Bootstrap 3');

  } else if(this.frameworkSelected == 'pure') {
      this.indexFile = this.appendStyles(this.indexFile, 'styles/vendor/pure.css', [
        'bower_components/pure/pure.css'
      ]);
    defaults.push('PureCSS');
  } else if(this.frameworkSelected == 'topcoat') {
      this.indexFile = this.appendStyles(this.indexFile, 'styles/vendor/topcoat-mobile-light.css', [
        'bower_components/topcoat/release/css/topcoat-mobile-light.css'
      ]);
    defaults.push('Topcoat');
  } else if(this.frameworkSelected == 'foundation') {
      this.indexFile = this.appendStyles(this.indexFile, 'styles/vendor/foundation.css', [
        'bower_components/foundation/scss/foundation.css'
      ]);
    defaults.push('Foundation');
  }

  if (this.includeRequireJS) {
    defaults.push('RequireJS');
  }

  if(this.asyncLocalStorage){
    this.indexFile = this.appendScripts(this.indexFile,
      'scripts/async-local-storage.js', [
      'scripts/async.localStorage.js',
      'scripts/async.localStorage.examples.js'
    ]);
    defaults.push('Async localStorage Polyfill');
  }

  if(this.fullscreenAPI){
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/fullscreensnippet.js', [
      'scripts/fullscreensnippet.js'
    ]);
    defaults.push('Fullscreen API snippet');
  }

  if(this.fastclickChoice){
    if (!this.includeRequireJS) {
      // Do not append fastclick script if using requirejs,
      // it will throw a mismatched anonymous define module error
      this.indexFile = this.appendScripts(this.indexFile, 'scripts/fastclick.js', [
        'bower_components/fastclick/lib/fastclick.js',
      ]);
    }
    defaults.push('FastClick');
  }

  // iterate over defaults and create content string
  defaults.forEach(function (el) {
    contentText.push('                    <li>' + el  +'</li>');
  });


  contentText = contentText.concat([
    '                </ul>',
    '                <p>installed.</p>',
    '                <h3>Enjoy coding! - Yeoman</h3>',
    ''
  ]);


  // append the default content
  contentText = contentText.join('\n');
  if(this.frameworkSelected == 'noframework') {
    contentText = '<div class="hero-unit">\n' + contentText+'</div>\n';
  }
  this.indexFile = this.indexFile.replace('<!--yeoman-welcome-->', contentText);
};

AppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.write('app/index.html', this.indexFile);
  this.write('app/scripts/hello.coffee', this.mainCoffeeFile);
  this.template('_main.js', 'app/scripts/main.js');
};

AppGenerator.prototype.install = function () {
  if (this.options['skip-install']) {
    return;
  }

  var done = this.async();
  this.installDependencies({
    skipMessage: this.options['skip-install-message'],
    skipInstall: this.options['skip-install'],
    callback: done
  });
};
