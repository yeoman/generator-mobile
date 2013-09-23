generator-mobile
================

A yeoman generator for mobile-first web apps. See the [wiki](https://github.com/yeoman/generator-mobile/wiki/Proposal) for
our proposal on what this generator should offer.

A project by Addy Osmani and Matt Gaunt.


## Grunt tasks

Consider this generator a reference point for how to improve your mobile web development workflow when using Grunt.  Some of the tasks we include (and highly recommend) include:

* [grunt-autoshot](https://npmjs.org/package/grunt-autoshot) for generating screenshots of your site at different viewport sizes
* [grunt-modernizr](https://npmjs.org/package/grunt-modernizr) for generating lean Modernizr builds based on the feature detects you actually use
* [grunt-svgmin](https://npmjs.org/package/grunt-svgmin) for minmizing your SVG files
* [grunt-contrib-imagemin](https://npmjs.org/package/grunt-contrib-imagemin) for keeping your image files optimized. With the size of the average page being 1.5MB, most of it being images, keeping your image filesizes down is super-important.
* [grunt-open](https://npmjs.org/package/grunt-open) for launching a browser window with BrowserStack using specific device/browser settings. We found this to be more usable than grunt-browserstack in practice.
* [grunt-webp](https://npmjs.org/package/grunt-webp) for encoding images as WebP
* [grunt-concurrent](https://npmjs.org/package/grunt-concurrent) for concurrently running tasks to shorten down build times

We also make use of some simple, but helpful configurations to tasks like grunt-contrib-watch for [syncronised cross-device livereloading](http://blog.mattbailey.co/post/50337824984/grunt-synchronised-testing-between-browsers-devices).