//
//  autocomplete-video.js
//  What Can A Technologist Do About Climate Change?
//
//  Bret Victor, November 2015
//  MIT open-source license.
//


(function(){

var setupAutocompleteVideo = this.setupAutocompleteVideo = function () {
    var div = document.querySelector(".autocomplete-video");
    var video = div.querySelector("video");
    prepareVideo(video, div);
}


function prepareVideo (video, div) {
    var ua = navigator.userAgent.toLowerCase();
    var noPlayButton = ua.match(/iphone/) || ua.match(/ipod/);

    var width = parseInt(video.getAttribute("width"));
    var height = parseInt(video.getAttribute("height"));
    
    var chrome = div.querySelector(".videoChrome");

    var videoOverlay = chrome.querySelector(".videoOverlay");
    var videoPlayButton = chrome.querySelector(".videoPlayButton");
    var videoDarken = chrome.querySelector(".videoDarken");
    var marker = chrome.querySelector(".marker");
    var markerProgressCanvas = chrome.querySelector(".markerProgressCanvas");
    var markerProgressOverlay = chrome.querySelector(".markerProgressOverlay");
    var markerPlayAgain = chrome.querySelector(".markerPlayAgain");
    
    var insetTop = parseInt(div.getAttribute("data-top") || "0");
    var insetBottom = parseInt(div.getAttribute("data-bottom") || "0");
    var insetRight = parseInt(div.getAttribute("data-right") || "0");
    var insetRightPost = parseInt(div.getAttribute("data-postright") || insetRight.toString());
    var insetLeft = parseInt(div.getAttribute("data-left") || "0");
    var pushLeft = parseInt(div.getAttribute("data-push-left") || "0");
    var verboseButton = parseInt(div.getAttribute("data-verbose-button") || "0");
    var noMarker = parseInt(div.getAttribute("data-no-marker") || "0");

    height -= insetTop + insetBottom;
    width -= insetLeft + insetRight + pushLeft;

    chrome.style.display = "block";

    if (verboseButton) { addClass(videoPlayButton, "verbose"); } 
    else { removeClass(videoPlayButton, "verbose"); }
    
    if (noPlayButton) { videoPlayButton.style.display = "none"; }
    if (noMarker) { marker.setStyle.display = "none"; }


    // sizes
    
    var updateSizes = function () {
        div.style.left = -pushLeft + "px";
        chrome.style.width = width + "px";
        chrome.style.height = height + "px";
        chrome.style.top = insetTop + "px";
        chrome.style.left = pushLeft + "px";
        videoOverlay.style.width = (width - 2) + "px";
        videoOverlay.style.height = (height - 2) + "px";
        videoOverlay.style.left  = insetLeft + "px";
        
        videoDarken.style.left = insetLeft + "px";
        videoPlayButton.style.left = Math.round(0.5 * (width - 78)) + "px";
        videoPlayButton.style.top = Math.round(0.5 * (height - (verboseButton ? 88 : 78))) + "px";
    };

    updateSizes();
    

    // playing

    var isPlaying = false;
    var didPlay = false;
    
    var playVideo = function () {
        isPlaying = true;
        didPlay = true;

        videoOverlay.style.display = "none";
        videoDarken.style.backgroundColor = "transparent";
        videoDarken.style.cursor = "none";

        markerProgressCanvas.style.display = "block";
        markerProgressOverlay.style.display = "block";
        markerPlayAgain.style.display = "none";
        
        width += insetRight - insetRightPost;
        insetRight = insetRightPost;
        updateSizes();
        
        updateCurrentTime();
        video.play();
    };
    
    var videoWasClicked = function () {
        if (isPlaying && !video.paused) {
            video.setAttribute("controls", "controls");
            videoDarken.style.display = "none";
            video.pause();
        }
        else {
            video.removeAttribute("controls");
            videoDarken.style.display = "block";
            playVideo();
        }
    };
    
    var updateCurrentTime = function () {
        var duration = video.duration;
        if (isNaN(duration) || duration <= 0) { return; }
        var currentTime = video.currentTime;
        if (isNaN(currentTime)) { currentTarget = 0; }
        
        updateCanvasWithProgress(markerProgressCanvas, currentTime / duration);
    };


    // video events

    video.addEventListener("timeupdate", function () {
        updateCurrentTime();
    }, false);
    
    video.addEventListener("ended", function () {
        isPlaying = false;
        
        videoDarken.style.cursor = "pointer";
        markerProgressCanvas.style.display = "none";
        markerProgressOverlay.style.display = "none";
        markerPlayAgain.style.display = "block";

    }, false);
    

    // marker mousing

    marker.addEventListener("click", function () {
        videoWasClicked();
    });


    // video mousing
    // (events added to videoDarken because iPad can't deal with click event on video element itself)
   
    videoDarken.addEventListener("click", function () {
        videoWasClicked();
    });

    videoDarken.addEventListener("mouseenter", function () {
        if (isPlaying) { return; }

        if (didPlay) {
            videoOverlay.style.display = "block";
        }
        else {
            videoDarken.style.backgroundColor = "rgba(0,0,0,0.1)";
        }
    });
    
    videoDarken.addEventListener("mouseleave", function () {
        if (isPlaying) { return; }

        if (didPlay) {
            videoOverlay.style.display = "none";
        }
        videoDarken.style.backgroundColor = "transparent";
    });
}


function updateCanvasWithProgress (canvas, progress) {
    var width = parseInt(canvas.getAttribute("width"));
    var height = parseInt(canvas.getAttribute("height"));
    var ctx = canvas.getContext("2d");
    
    ctx.clearRect(0,0,width,height);
    ctx.save();
    ctx.translate(width/2, height/2);
    
    var radius = width/2 - 1;

    ctx.beginPath();
    ctx.arc(0,0, radius, -Math.PI * 0.5, -Math.PI * 0.5 + progress * Math.PI * 2);
    ctx.lineTo(0,0);
    ctx.lineTo(0, radius);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fill();
    
    ctx.restore();
}


//====================================================================================

})();

