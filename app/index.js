'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
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
  this.mainJsFile = '';
  this.mainCoffeeFile = 'console.log "\'Allo from CoffeeScript!"';

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

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
    name: 'frameworkChoice',
    message: 'Would you like to include a mobile-first UI framework?\n    1: Twitter Bootstrap\n    2: PureCSS\n    3: TopCoat\n    4: Foundation\n    0: No Framework\n',
    default: 0
  },{
    type: 'confirm',
    name: 'layoutChoice',
    message: 'Would you like to include some layout boilerplate for this framework?',
    default: false
  }, {
    type: 'confirm',
    name: 'includeRequireJS',
    message: 'Would you like to include RequireJS (for AMD support)?',
    default: true
  },{
    type: 'confirm',
    name: 'fastclickChoice',
    message: 'Would you like to include FastClick to remove click delays in touch UIs?',
    default: false
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
    name: 'saucelabs',
    message: 'Would you like to set-up a SauceLabs task to run automated tests?',
    default: false
  },{
    type:'confirm',
    name:'browserstack',
    message: 'Would you like to use BrowserStack for device testing?'
  }];


  this.prompt(prompts, function (props) {
    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.includeRequireJS = props.includeRequireJS;
    this.frameworkChoice = props.frameworkChoice;
    this.layoutChoice = props.layoutChoice;
    this.fastclickChoice = props.fastclickChoice;
    this.asyncLocalStorage = props.asyncLocalStorage;
    this.fullscreenAPI = props.fullscreenAPI;
    this.saucelabs = props.saucelabs;
    this.browserstack =  props.browserstack;
    this.webpSupport = props.webpSupport;

    cb();
  }.bind(this));
};

// ---------------------------------------------------------------
// Mobile-first UI Frameworks
// ---------------------------------------------------------------
// TODO: Use Bower for pulling all of these deps in
// TODO: Don't use pre-minified versions of these deps

AppGenerator.prototype.bootstrapJs = function bootstrapJs() {
  if(this.frameworkChoice == 1) {
    this.frameworkSelected = 'bootstrap';
    this.copy('layouts/bootstrap/assets/css/bootstrap.css', 'app/styles/vendor/bootstrap/bootstrap.css');
    this.copy('layouts/bootstrap/assets/js/bootstrap.min.js', 'app/scripts/vendor/bootstrap/bootstrap.js');
  }
}

AppGenerator.prototype.pure = function pure() {
  if(this.frameworkChoice == 2) {
    this.frameworkSelected = 'pure';
    this.copy('layouts/pure/stylesheets/pure-min.css', 'app/styles/vendor/pure/pure-min.css');
  }
}

AppGenerator.prototype.topcoat = function topcoat() {
  if(this.frameworkChoice == 3) {
    this.frameworkSelected = 'topcoat';
    this.copy('layouts/topcoat/css/topcoat-mobile-light.css', 'app/styles/vendor/topcoat/topcoat-min.css');
  }
}

AppGenerator.prototype.foundation = function foundation() {
  if(this.frameworkChoice == 4) {
    this.frameworkSelected = 'foundation';
    this.copy('layouts/foundation/stylesheets/foundation.min.css', 'app/styles/vendor/foundation/foundation-min.css');
  }
}


// ----------------------------------------------------------------
// Layouts
// ----------------------------------------------------------------

AppGenerator.prototype.addLayout = function gruntfile() {
  var layoutStr = "<!--yeoman-welcome-->";

  if(this.layoutChoice && this.frameworkChoice) {

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

      //TODO: Get a Topcoat boilerplate
      //this.readFileAsString(path.join(this.sourceRoot(), 'layouts/bootstrap/index.html');

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

AppGenerator.prototype.fastclick = function fastclick() {
  if(this.fastclickChoice){
    this.copy('fastclick.js', 'app/scripts/fastclick.js');
    this.copy('fastclick.example.js', 'app/scripts/fastclick.example.js');
  }
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
  var requiredScripts = ['app', 'jquery'];
  var bootstrapPath;
  if(this.frameworkChoice == 1) {
    requiredScripts.push('bootstrap');
    bootstrapPath = ',\n        bootstrap: \'vendor/bootstrap/bootstrap\'\n    },';
  } else {
    bootstrapPath = '    },';
  }

  if (this.includeRequireJS) {
    var requiredScriptsString = '[';
    for(var i = 0; i < requiredScripts.length; i++) {
      requiredScriptsString += '\''+requiredScripts[i]+'\'';
      if((i+1) < requiredScripts.length) {
        requiredScriptsString += ', ';
      }
    }
    requiredScriptsString += ']';

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

    this.mainJsFile = [
      'require.config({',
      '    paths: {',
      '        jquery: \'../bower_components/jquery/jquery\'',
      bootstrapPath,
      '    shim: {',
      '        bootstrap: {',
      '            deps: [\'jquery\'],',
      '            exports: \'jquery\'',
      '        }',
      '    }',
      '});',
      '',
      'require(' + requiredScriptsString + ', function (app, $) {',
      '    \'use strict\';',
      '    // use app here',
      '    console.log(app);',
      '    console.log(\'Running jQuery %s\', $().jquery);',
      '});'
    ].join('\n');
  }
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  // prepare default content text
  var defaults = ['HTML5 Boilerplate'];


  var contentText = [
    '                <h1>\'Allo, \'Allo!</h1>',
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

  if(this.frameworkChoice == 1) {
    // Add Twitter Bootstrap scripts
    this.indexFile = this.appendStyles(this.indexFile, 'styles/vendor/bootstrap.css', [
      'styles/vendor/bootstrap/bootstrap.css'
    ]);

    defaults.push('Twitter Bootstrap 3');

  } else if(this.frameworkChoice == 2) {
    this.indexFile = this.appendStyles(this.indexFile, 'styles/vendor/pure.min.css', [
      'styles/vendor/pure/pure-min.css'
      ]);
    defaults.push('PureCSS');
  }

  if (this.includeRequireJS) {
    defaults.push('RequireJS');
  } else {
    this.mainJsFile = 'console.log(\'\\\'Allo \\\'Allo!\');';
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
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/fastclick.js', [
      'scripts/fastclick.js',
      'scripts/fastclick.example.js'
    ]);
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
  this.indexFile = this.indexFile.replace('<!--yeoman-welcome-->', contentText.join('\n'));
};

AppGenerator.prototype.addSaucelabs = function gruntfile() {
  if(!this.saucelabs) {
    return;
  }

  var filesToCopy = [
    'license.html',
    'NOTICE.txt',
    'Sauce-Connect.jar',
    'test.js'
  ];

  for(var i = 0; i < filesToCopy.length; i++) {
    this.copy('test/saucelabs/'+filesToCopy[i], 'test/saucelabs/'+filesToCopy[i]);
  }
};

AppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.write('app/index.html', this.indexFile);
  this.write('app/scripts/main.js', this.mainJsFile);
  this.write('app/scripts/hello.coffee', this.mainCoffeeFile);
};
