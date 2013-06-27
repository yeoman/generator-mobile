
// To instantiate FastClick on the body, which is the recommended method of use:

window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

/*
Don't forget to add a shim for addEventListener if you want to support IE8 and below.

Otherwise, if you're using jQuery:

$(function() {
    FastClick.attach(document.body);
});
*/