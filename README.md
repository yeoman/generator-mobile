# Generator Mobile [![Build Status][travis-img]][travis-link] 

A mobile-first generator based on [Web Starter Kit][wsk-repo].

[![Web Starter Kit][wsk-screenshot1]][wsk-repo]

In addition to what Web Starter Kit already provides, this generator creates 
a `deploy` task. 

![Yeoman generator][wsk-screenshot2]

## Getting started

You will need [NodeJS](http://nodejs.org/), [npm](https://www.npmjs.org/) and [yeoman](http://yeoman.io/) installed.

1. Install this generator with `npm install --global generator-mobile`.
2. Run `yo mobile` and answer a few questions about the site you want to build.
3. The latest release will be fetched from [Web Starker Kit repo][wsk-repo] 
   and adjusted accordingly to your answers.
4. Build the site as usual using the instructions on the [WSK repo](https://github.com/google/web-starter-kit#quickstart) skipping the download step.
5. If you've chosen a deployment option, run `gulp deploy` to publish the site.

## Hosting and Deployment options

There are 3 hosting categories currently supported by the generator:
static hosting, PaaS providers and regular servers.

Here's a list of implementation status for each category.

**Static hosting**

* [ ] [AWS S3][aws-s3]
* [x] [GitHub Pages][gh-pages]
* [ ] [Google Cloud Storage (GCS)][gcs]

**PaaS**

* [x] [Google App Engine (GAE)][gae]
* [ ] [Heroku][heroku-website]

**Servers**

* [ ] [Apache server][httpd]
* [ ] [Nginx server][nginx]
* [ ] [NodeJS server][nodejs-server]

**Deployment options (servers only)**

* [ ] [Secure FTP (FTP via SSH)][sftp-wiki]
* [ ] [rsync][rsync-wiki]

Please, refer to the [docs folder](docs/) for details about hosting and
deployment.

## Development

1. Fork the repo and create a local copy with

   `git clone git@github.com:user/generator-mobile.git`.

2. Create a new branch to work on a bugfix or a new feature with

   `git checkout -b branch-name`.

3. Add new [tests](test/) or modify existing ones to reflect the changes 
   you want to make.
4. Make the changes until `npm test` is all green again.
5. Occasionally push changes to github with `git push origin branch-name`.
6. Iterate over 3-5 as many times as you want.
7. You can also try running the generator with your local changes manually
   using [npm link](https://www.npmjs.org/doc/cli/npm-link.html).
8. Once you're satisfied, [create a pull request](https://help.github.com/articles/creating-a-pull-request/).

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
Copyright (c) Google


[wsk-repo]: https://github.com/google/web-starter-kit
[wsk-screenshot1]: https://camo.githubusercontent.com/a1b538962fa669f54f37509f8961613aa4753254/687474703a2f2f692e696d6775722e636f6d2f6e475572456d782e706e67
[wsk-screenshot2]: https://cloud.githubusercontent.com/assets/25405/5183611/9ace76a4-74a8-11e4-978a-17fda7eb4cfd.png
[travis-img]: https://secure.travis-ci.org/yeoman/generator-mobile.svg?branch=master
[travis-link]: https://travis-ci.org/yeoman/generator-mobile
[aws-s3]: http://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html
[gh-pages]: https://pages.github.com/
[gcs]: https://cloud.google.com/storage/docs/website-configuration
[gae]: https://cloud.google.com/appengine/
[heroku-website]: https://www.heroku.com/
[httpd]: http://httpd.apache.org/
[nginx]: http://nginx.org/en/
[nodejs-server]: https://github.com/h5bp/server-configs-node
[sftp-wiki]: http://en.wikipedia.org/wiki/SSH_File_Transfer_Protocol
[rsync-wiki]: http://en.wikipedia.org/wiki/Rsync
