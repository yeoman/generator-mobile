'use strict';
var request = require('request');
var Download = require('download');
var WSK_RELEASES_URL = 'https://api.github.com/repos/google/web-starter-kit/releases';
var WSK_ZIP_URL = 'https://github.com/google/web-starter-kit/archive/';

function getLatestRelease(cb) {
  var opts = {
    url: WSK_RELEASES_URL,
    json: true,
    headers: {
      'User-Agent': 'generator-mobile',
      Accept: 'application/vnd.github.v3+json'
    }
  };

  request(opts, function (err, res, body) {
    if (err || res.statusCode !== 200) {
      cb(err || new Error(body || 'web-starter-kit/releases replied with ' + res.statusCode));
      return;
    }

    var release = {tag_name: ''};

    for (var i = 0, r; (r = body[i]); i++) {
      if (release.tag_name < r.tag_name) {
        release = r;
      }
    }

    if (!release.tag_name) {
      err = new Error('could not fetch WSK release version');
    }

    cb(err, release);
  });
}

function createDownloader(opts, cb) {
  getLatestRelease(function (err, ver) {
    if (err) {
      cb(err);
      return;
    }

    var url = WSK_ZIP_URL + ver.tag_name + '.zip';
    cb(null, new Download(opts).get(url), url, ver);
  });
}

module.exports = createDownloader;
module.exports.WSK_ZIP_URL = WSK_ZIP_URL;
