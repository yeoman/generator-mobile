'use strict';
<% if (includeRequireJS) { %>
require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery'<% if (frameworkSelected == 'bootstrap') { %>,
        bootstrap: 'vendor/bootstrap/bootstrap'<% } if (fastclickChoice) { %>,
        fastclick: '../bower_components/fastclick/lib/fastclick'<% } %>
    },
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    }
});

require(['jquery'<% if (fastclickChoice) { %>, 'fastclick'<% } if (frameworkSelected == 'bootstrap') { %>, 'bootstrap'<% } %>], function ($<% if (fastclickChoice) { %>, FastClick<% } %>) {<% if (fastclickChoice) { %>
    FastClick.attach(document.body);<% } %>
    console.log('Running jQuery %s', $().jquery);
});
<% } else { %>
<% if (fastclickChoice) { %>
// The script must be loaded prior to instantiating FastClick on any element of the page.
window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);
<% } %>
console.log('Allo Allo!');
<% } %>
