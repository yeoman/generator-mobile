'use strict';
var request = require('request');

var SERVER_CONFIG = {
  gae: {
    filename: 'app.yaml',
    url: 'https://raw.githubusercontent.com/h5bp/server-configs-gae/master/app.yaml'
  },
  apache: {
    filename: '.htaccess',
    url: 'https://raw.githubusercontent.com/h5bp/server-configs-apache/master/dist/.htaccess'
  }
};

function config(provider) {
  return SERVER_CONFIG[provider];
}

function isSupported(provider) {
  return config(provider) ? true : false;
}

function fetchConfig(provider, cb) {
  var cfg = config(provider);

  if (!cfg) {
    cb(new Error('unknown provider: ' + provider));
    return;
  }

  request(cfg.url, function (err, res, body) {
    if (!err && res.statusCode !== 200) {
      err = new Error('config fetch error ' + res.statusCode);
    }

    cb(err, cfg, body);
  });
}

module.exports = {
  config: config,
  isSupported: isSupported,
  fetchConfig: fetchConfig
};
