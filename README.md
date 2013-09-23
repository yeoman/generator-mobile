generator-mobile
================

An experimental Yeoman generator for mobile-first web apps by Addy Osmani and Matt Gaunt. A good reference point for setting up a mobile web development workflow with [Grunt](http://gruntjs.com).

![](http://i.imgur.com/8nNZIg7.png)

## Features

All optional via prompts:

* Scaffold support for [Bootstrap 3](http://getbootstrap.com), [TopCoat](http://topcoat.io), [Zurb Foundation](http://foundation.zurb.com/) and [Pure](http://purecss.io/)
* Generates responsive images for `srcset`
* Generates screenshots of your site at different viewport sizes
* Uses [BrowserStack](http://browserstack.com) for cloud device testing
* Includes [FastClick](https://github.com/ftlabs/fastclick) to avoid iOS touch delays
* Includes boilerplate for FullScreen API
* Includes only the Modernizr feature detects your projects uses
* Converts images to WebP
* Includes a polyfill for [async. localStorage](https://github.com/slightlyoff/async-local-storage)


## Getting Started

- Install: `npm install -g generator-mobile`
- Run: `yo mobile`
- Perform a build: `grunt`
- Run local server: `grunt server`
- Take screenshots: `grunt screenshots`
- Run in BrowserStack: `grunt open [nexus4 | nexus7 | iphone5]`

![alt text](http://i.imgur.com/OAbqaZf.png "Screenshots Example")


## Why a mobile web-app generator?

Increasingly the device our users choose to access the web is not a laptop or desktop, but rather a mobile device or tablet. A different mindset is required when developing for these devices as we need to think in terms of finite resources. With the mobile web development landscape being so fragmented, we wanted to see how we could simplify this using Grunt.

`generator-mobile` doesn't claim to the best solution for mobile web development tooling, but we do include solutions for many of the pain-points developers commonly run into when targeting the mobile web. Cross-device testing, target-device screenshots, optimising builds - these are just a few of the problems we include reference solutions for via Grunt tasks.

You can either look at the Gruntfile we generate for a few interesting ideas or just use the generator out of the box to get them for free.

## Mobile-first framework scaffolding

When initially working on your app, you may find yourself searching for a boilerplate to use for your prototypes. A number of UI frameworks with a mobile focus have appeared over the past few years including Twitter Bootstrap 3, Foundation, Pure and TopCoat - some of which have invested a lot of time into improving their rendering performance for mobile devices.

When you run `yo mobile` we give you the choice to scaffold out a new application using any of the four options above, writing some boilerplate layout for you in the process.

![alt text](http://i.imgur.com/QreXs0rl.jpg "Mobile First Frameworks")

## Synchronised cross-device live reloading

A lot of the time we end up testing what an app looks like or how it behaves after we've created a version for desktop, hacking away at our breakpoints until they look good. Instead, wouldn't it be better if you had a real-time view of what your page looks like on all your devices *while* you code? You can thanks to some small changes in configuration you can make to `connect` (which we do for you as a part of this generator).

With it setup in your Gruntfile, change `hostname` > `localhost` to `0.0.0.0`. Run `grunt server` on a specific port. Perhaps `localhost:9000`, then open up `ifconfig` and search for `inet` to discover your computer's IP address (e.g `192.16.23.149`). You can now open up your IP followed by the port number on any device (e.g `192.16.23.149:9000`) and get LiveReload working any time you make a change to your source.

![alt text](http://i.imgur.com/lypd4xQ.gif "Live Reload Example")

## Device testing in the cloud

BrowserStack have a large catalog of setups available for mobile device testing and are fairly easy to use. You select an operating system, select your browser version and device type, select a URL to browser and it will spin up a hosted virtual machine that you can interact with. You also get access to the most common browser developer tools such as Chrome DevTools and Firebug.

There are Grunt tasks available for firing new emulators up using BrowserStack such as grunt-browserstack In our experience however it’s usually just easier to use grunt-open to open up your browser window for you then navigate to the browserstack site with the device/OS you want to test. 

`yo mobile` offers this via our prompts if you would like to use it.

![alt text](http://i.imgur.com/ptpnQVR.gif "Browser Stack Demo")

## Grunt tasks

Consider this generator a reference point for how to improve your mobile web development workflow when using Grunt.  Some of the tasks we include (and highly recommend) include:

* [grunt-responsive-images](https://npmjs.org/package/grunt-responsive-images) for generating multi-resolution images at predefined widths. For use with `srcset` or a responsive imaging strategy like [Imager.js](https://github.com/BBC-News/Imager.js/)
* [grunt-autoshot](https://npmjs.org/package/grunt-autoshot) for generating screenshots of your site at different viewport sizes
* [grunt-modernizr](https://npmjs.org/package/grunt-modernizr) for generating lean Modernizr builds based on the feature detects you actually use
* [grunt-svgmin](https://npmjs.org/package/grunt-svgmin) for minmizing your SVG files
* [grunt-contrib-imagemin](https://npmjs.org/package/grunt-contrib-imagemin) for keeping your image files optimized. With the size of the average page being 1.5MB, most of it being images, keeping your image filesizes down is super-important.
* [grunt-open](https://npmjs.org/package/grunt-open) for launching a browser window with BrowserStack using specific device/browser settings. We found this to be more usable than grunt-browserstack in practice.
* [grunt-webp](https://npmjs.org/package/grunt-webp) for encoding images as WebP
* [grunt-concurrent](https://npmjs.org/package/grunt-concurrent) for concurrently running tasks to shorten down build times

We also make use of some simple, but helpful configurations to tasks like grunt-contrib-watch for [syncronised cross-device livereloading](http://blog.mattbailey.co/post/50337824984/grunt-synchronised-testing-between-browsers-devices).

![alt text](http://i.imgur.com/qBMKtGul.gif "Live Reload Across Devices Example")

## Not included, but suggested

While we decided not to include them as part of this generator's workflow, you may also find the following Grunt tasks helpful during mobile web development:

* [grunt-pagespeed](https://github.com/jrcryer/grunt-pagespeed) - uses Google's PageSpeed service to run a number of different speed tests against your page for mobile or desktop.
* [grunt-montage](https://github.com/globaldev/grunt-montage) and [grunt-spritesheet](https://github.com/nicholasstephan/grunt-spritesheet) - generates a CSS sprite sheet out of individual PNGs with support for multiple sprites per CSS file
* [grunt-zopfli](https://github.com/mathiasbynens/grunt-zopfli) - compress files using the Zopfli compression scheme
* [grunt-stripmq](https://github.com/jtangelder/grunt-stripmq) - generates fallback versions of mobile-first stylesheets
* [grunt-manifest](https://github.com/gunta/grunt-manifest) - generates appcache manifests

![](http://i.imgur.com/LBkkq61.png)

## What other problems are you looking at?

Advanced CSS optimization at build time is the next set of challenges we're focusing on. In particular, how to automate the inlining of critical-path CSS to improve the time-to-glass experience of your homepage and removing [unused CSS](https://github.com/addyosmani/grunt-uncss) in your project's stylesheets during build-time.

We are also looking at how we can improve the development of mobile web apps targeting tools like Cordova through related projects like [generator-cordova](https://github.com/dangeross/generator-cordova).


