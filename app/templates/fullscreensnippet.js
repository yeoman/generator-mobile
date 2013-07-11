


// Sample code for using the Fullscreen API
// ==========================================

document.cancelFullScreen = document.webkitCancelFullScreen || document.mozCancelFullScreen || document.cancelFullScreen;

document.body.requestFullScreen = document.body.webkitRequestFullScreen || document.body.mozRequestFullScreen || document.body.requestFullScreen;

function displayFullScreenStatus() {
    var status = isFullScreen() ? 'Document is now full screen.' : 'Document is currently not full screen.';
    document.querySelector('#status')
        .innerHTML = status;
}

displayFullScreenStatus(); // on load

document.onfullscreenchange = document.onwebkitfullscreenchange = document.onmozfullscreenchange = displayFullScreenStatus;

function isFullScreen() {
    return !!(document.webkitIsFullScreen || document.mozFullScreen || document.isFullScreen); // if any defined and true
}

function fullScreenElement() {
    return document.webkitFullScreenElement || document.webkitCurrentFullScreenElement || document.mozFullScreenElement || document.fullScreenElement;
}

var el = document.getElementById("fullscreenTest");

el.requestFullScreen = el.webkitRequestFullScreen || el.mozRequestFullScreen || el.requestFullScreen;

document.body.onclick = function(e) {
    console.log(fullScreenElement());
    if ((isFullScreen() && e.target !== el) || fullScreenElement() === el) {
        document.cancelFullScreen();
    } else if (e.target === el) {
        el.requestFullScreen();
    } else {
        document.body.requestFullScreen();
    }
};



// TODO: Bootstrap layout is currently the only one which properly handles the fullscreen
// button injection. This should be done more generally (i.e inject via index.js)