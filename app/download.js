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
      'Accept': 'application/vnd.github.v3+json'
    }
  }
  request(opts, function(err, res, body) {
    var release = {tag_name: ''};
    for (var i = 0, r; r = body[i]; i++) {
      if (release.tag_name < r.tag_name)
        release = r
    }
    cb(release);
  })
}

function createDownloader(opts, cb) {
  getLatestRelease(function(r){
    var url = WSK_ZIP_URL + r.tag_name + '.zip';
    cb(new Download(opts).get(url), url, r);
  });
}

module.exports = createDownloader;
