//
//  main.js
//  What Can A Technologist Do About Climate Change?
//
//  Bret Victor, November 2015
//  MIT open-source license.
//

var isTouchDevice = !!("ontouchstart" in window);

window.onload = function () {
    if (isTouchDevice) { addClass(document.body, "touch-device"); }

    chain([
        setupTableOfContents,
        loadScripts,
        preloadImages,
        setupCarbonBudget,
        setupClunker,
        setupPreviewImages,
        setupDynamicToolsVideos,
        setupAutocompleteVideo,
    ]);
    
    function chain (funcs) {
        setTimeout(next, 10);
        function next () {
            if (funcs.length == 0) { return; }
            (funcs.shift())();
            setTimeout(next, 10);
        }
    }
}


//---------------------------------------------------------------------
// toc

function setupTableOfContents () {
    var template = document.getElementById("toc-template");
    var tocs = nodeArray(document.querySelectorAll(".toc"));
    
    tocs.forEach(function (toc) {
        if (toc === template) { return; }
        toc.innerHTML = template.innerHTML;
        
        var activeChapter = toc.querySelector(".toc-" + toc.id);
        activeChapter.className += " toc-active";
    });
}


//---------------------------------------------------------------------
// scripts

var scripts = {};

function loadScripts () {
    var divs = nodeArray(document.querySelectorAll(".script"));
    loadNextDiv();
    
    function loadNextDiv () {
        if (divs.length == 0) { return; }
        var div = divs.shift();
        var params = div.getAttribute("data-script").split(/\s/);

        var name = params.shift();
        params.unshift(div);
        
        var func = scripts[name];
        func.apply(undefined, params);
        
        window.setTimeout(loadNextDiv, 5); 
    }
}

scripts["svg"] = function (div, name) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "Images/" + name + ".svg");
    xhr.onload = function () { div.innerHTML = xhr.responseText };
    xhr.send();
}

scripts["chart"] = function (div, name) {
    placeChart(div, name);
};


//---------------------------------------------------------------------
// videos

function setupDynamicToolsVideos () {
    var divs = nodeArray(document.querySelectorAll(".dynamic-tools-thumbnail"));
    divs.forEach(function (div) {
        var video = div.querySelector("video");
        var img = div.querySelector("img");
        if (!video || !img) { return; }
        div.addEventListener("mouseenter", function () {
            video.play();
            img.style.visibility = "hidden";
        });
        div.addEventListener("mouseleave", function () {
            img.style.visibility = "visible";
            video.pause();
            video.currentTime = 0;
        });
    });
}


//---------------------------------------------------------------------
// preload images

var mainPreloadedImages;

function preloadImages () {
    var urls = [ "Images/01-carbon-budget-knob-down.png" ];
    mainPreloadedImages = urls.map(function (url) {
        var image = new Image();
        image.src = url;
        return image;
    });
}


//---------------------------------------------------------------------
// util

function nodeArray (nodeList) {
    return Array.prototype.slice.call(nodeList);
}

function createElement (tag, properties) {
    var el = document.createElement(tag);
    Object.getOwnPropertyNames(properties || {}).forEach(function (k) {
        if (k === "html") { el.innerHTML = properties[k]; }
        else { el.setAttribute(k, properties[k]); }
    });
    return el;
}

function hasClass (el,clas) {
    var classes = (el.className || "").split(" ");
    return classes.some(function (c) { return c === clas; });
}

function addClass (el,clas) {
    if (hasClass(el,clas)) { return; }
    el.className = (el.className !== undefined && el.className.length) ? (el.className + " " + clas) : clas;
}

function removeClass (el,clas) {
    var classes = (el.className || "").split(" ");
    var newName = classes.filter(function (c) { return c !== clas; }).join(" ");
    if (el.className !== newName) { el.className = newName; }
}

function getInheritedAttribute (el, attr) {
    for (var node = el; node && node !== document.body; node = node.parentNode) {
        var a = node.getAttribute(attr);
        if (a) { return a; }
    }
    return undefined;
}

function ancestorWithClass (el, clas) {
    if (Array.isArray(clas)) {
        return clas.reduce(function (a,c) { return a || ancestorWithClass(el, c); }, null);
    }

    for (var node = el; node && node !== document.body; node = node.parentNode) {
        if (hasClass(node, clas)) { return node; }
    }
    return null;
}

function ancestorWithTagName (el, tag) {
    if (Array.isArray(tag)) {
        return tag.reduce(function (a,c) { return a || ancestorWithTagName(el, c); }, null);
    }

    for (var node = el; node && node !== document.body; node = node.parentNode) {
        var t = (node.tagName || "").toLowerCase();
        if (t && t === tag) { return node; }
    }
    return null;
}

function lerp (a,b,t) { return a + (b - a) * t; };
function remap (x,fromLow,fromHigh,toLow,toHigh) { return lerp(toLow, toHigh, (x - fromLow) / (fromHigh - fromLow)); };

