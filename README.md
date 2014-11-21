# Generator Mobile [![Build Status](https://secure.travis-ci.org/yeoman/generator-jquery.svg?branch=wsk)](https://travis-ci.org/yeoman/generator-mobile) 

A mobile first generator based on [Web Starter Kit](https://github.com/google/web-starter-kit).

[![Web Starter Kit](https://camo.githubusercontent.com/a1b538962fa669f54f37509f8961613aa4753254/687474703a2f2f692e696d6775722e636f6d2f6e475572456d782e706e67)](https://github.com/google/web-starter-kit)

## Features

In addition to what Web Starter Kit already provides, this generator creates a new `deploy` task. 

Supported hosting and deployment strategy options:

* [x] Google App Engine (GAE)
* [x] GitHub Pages
* [ ] Heroku
* [ ] Google Cloud Storage (GCS)
* [ ] AWS S3
* [ ] Apache server
* [ ] Nginx server
* [ ] NodeJS server
* [ ] Deployment via Secure FTP (FTP via SSH)
* [ ] Deployment via rsync

## Getting started

You will need [NodeJS](http://nodejs.org/), [npm](https://www.npmjs.org/) and [yeoman](http://yeoman.io/) installed.

1. Install this generator with `npm install -g yeoman/generator-mobile`
2. Run `yo mobile`. The generator will ask you a few questions about the site you want to build.
3. The latest release will be fetched from Web Starker Kit repo and adjusted accordingly to your answers.
4. Build the site as usual using the instructions on the [WSK repo](https://github.com/google/web-starter-kit#quickstart) skipping the download and dependencies install steps.
5. If you've chosen a deployment option, run `gulp deploy` to publish the site.
