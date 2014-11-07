'use strict';

var path = require('path');


/**
 * Separator object for Inquirer.js
 * because we don't want to import the whole module
 * just to have a separator.
 */

function Separator(line) {
  this.type = "separator";
  this.line = chalk.dim(line || new Array(15).join('-'));
}

Separator.exclude = function( obj ) {
  return obj.type !== "separator";
};

Separator.prototype.toString = function() {
  return this.line;
};


module.exports = [
  {
    message: 'Do you want a default layout?',
    name: 'layoutChoice',
    type: 'list',
    choices: [
      {value: 'default', name: 'Yes, supports IE10+'},
      {value: 'ie8', name: 'No, barebones html file'}
    ],
    default: 'default'
  },
  {
    message: 'Site name',
    name: 'siteName',
    default: process.cwd().split(path.sep).pop()
  },
  {
    message: 'Site description',
    name: 'siteDescription'
  },
  {
    message: 'Use Google Analytics?',
    name: 'shouldUseGA',
    type: 'confirm',
    default: false
  },
  {
    message: 'Use build system?',
    name: 'shouldUseBuild',
    type: 'confirm',
    default: true
  },
  {
    message: 'Use Pagespeed?',
    name: 'shouldUsePagespeed',
    type: 'confirm',
    default: true
  },

  // -------------- hosting providers ------------------

  {
    message: 'Which hosting provider would you like to use?',
    name: 'hostingCat',
    type: 'list',
    choices: [
      {value: 'paas', name: 'PaaS (GAE, Heroku)'},
      {value: 'static', name: 'Static (GitHub, GCS, S3)'},
      {value: 'server', name: 'Server (Apache, Nginx, etc.)'},
      {value: 'none', name: "None of the above, don't worry about it"}
    ],
    default: 'none'
  },
  {
    message: 'Which PaaS is it?',
    name: 'hostingChoice',
    type: 'list',
    choices: [
      {value: 'gae', name: 'Google App Engine (GAE)'},
      {value: 'heroku', name: 'Heroku'},
      {value: 'none', name: 'None of the above'}
    ],
    default: 'none',
    when: function(answers) {
      return answers.hostingCat === 'paas';
    }
  },
  {
    message: 'Which static hosting is it?',
    name: 'hostingChoice',
    type: 'list',
    choices: [
      {value: 'github', name: 'GitHub'},
      {value: 'gcs', name: 'Google Cloud Storage (GCS)'},
      {value: 's3', name: 'Amazon AWS S3'},
      {value: 'none', name: 'None of the above'}
    ],
    default: 'none',
    when: function(answers) {
      return answers.hostingCat === 'static';
    }
  },
  {
    message: 'Which server is it?',
    name: 'hostingChoice',
    type: 'list',
    choices: [
      {value: 'apache', name: 'Apache'},
      {value: 'nginx', name: 'Nginx'},
      {value: 'nodejs', name: 'Node.js'},
      {value: 'other', name: 'Other'}
    ],
    default: 'other',
    when: function(answers) {
      return answers.hostingCat === 'server';
    }
  },

  // -------------- GAE (PaaS hosting) ------------------

  {
    message: ('What Project ID should we use?\n  (you can see all '+
              'your projects on https://cloud.google.com/console)\n '),
    name: 'gaeProjectId',
    when: function(answers) {
      return answers.hostingChoice === 'gae';
    }
  },

  // -------------- Heroku (PaaS hosting) ------------------

  {
    message: ("What is your Heroku app name?\n  (just hitting enter "+
              "is OK, we'll create one for you)\n "),
    name: 'herokuApp',
    when: function(answers) {
      return answers.hostingChoice === 'heroku';
    }
  },

  // -------------- GCS / S3 (static hosting) ------------------

  {
    message: "Site domain (e.g. www.example.org) or a bucket name",
    name: 'siteDomain',
    when: function(answers) {
      return answers.hostingChoice.match(/gcs|s3/);
    }
  },

  // -------------- GitHub (static hosting) ------------------

  {
    message: "GitHub username or owner/project",
    name: 'githubTarget',
    when: function(answers) {
      return answers.hostingChoice === 'github';
    }
  },
  {
    message: "Custom domain (e.g. www.example.org) or just hit enter if you don't have one",
    name: 'siteDomain',
    when: function(answers) {
      return answers.hostingChoice === 'github';
    }
  },

  // -------------- deployment (server only) ------------------

  {
    message: 'What is your deployment strategy?',
    name: 'deployChoice',
    type: 'list',
    choices: [
      {value: 'sftp', name: 'Secure FTP (FTP via SSH)'},
      {value: 'rsync', name: 'rsync'},
      {value: 'none', name: 'None of the above'}
    ],
    default: 'none',
    when: function(answers) {
      return answers.hostingCat === 'server';
    }
  },
  {
    message: 'Deployment URL (e.g. user@server:[path])',
    name: 'deployDest',
    when: function(answers) {
      return answers.deployChoice !== 'none';
    }
  }
];
