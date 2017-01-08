//
//  previews.js
//  What Can A Technologist Do About Climate Change?
//
//  Bret Victor, November 2015
//  MIT open-source license.
//

var previewsComeFromAWS = true;
var previewImagesByURL = {};

var setupPreviewImages = this.setupPreviewImages = function () {
    if ("ontouchstart" in window) { return; }  // no previews on touch device

    setupRecentScroll();
    
    var links = getPreviewLinks();
    var names = getPreviewNamesForLinks(links);
    
    setupPreviewSubset(names,links,0,3,0);
    setupPreviewSubset(names,links,3,30,2000);
    setupPreviewSubset(names,links,30,100,3000);
    setupPreviewSubset(names,links,100,1000,4000);
};

function setupPreviewSubset (names, links, from, to, timeout) {
    setTimeout(function () {
        loadPreviewImagesWithNames(names.slice(from,to));
        setupPreviewLinks(links.slice(0,to));
    }, timeout || 0);
}

function loadPreviewImagesWithNames (names) {
    names.forEach(function (name) {
        var image = new Image();
        var url = getPreviewImageURLForName(name);
        image.src = url;
        previewImagesByURL[url] = image;
    });
}

function setupPreviewLinks (links) {
    links.forEach(function (link) {
        var url = getPreviewImageURLForLinkURL(link.getAttribute("href") || "");
        if (previewImagesByURL[url]) {
            setupPreviewLink(link, url);
        }
    });
}

function setupPreviewLink (link, url) {
    if (link.onmouseenter) { return; }

    var containerID = getInheritedAttribute(link, "data-preview-container");
    var cite = ancestorWithClass(link, "cite");
    var container = containerID ? document.getElementById(containerID) : cite ? cite.parentNode : undefined;

    var previewHeight = 320;
    var previewBorderOffset = 0;

    link.onmouseenter = function () {
        if (recentlyScrolled) { return; }
    
        var windowHeight = window.innerHeight;
        var linkY = Math.round(link.getBoundingClientRect().top);
        var previewY = Math.round(Math.max(10, Math.min(windowHeight - previewHeight - 10, linkY - previewHeight/3)));
        var previewOffset = (containerID ? 0 : (previewY - linkY)) - previewBorderOffset;
    
        var preview = createElement("img", { 
            "class": "link-preview", 
            "style": "margin-top:" + previewOffset + "px",
            "src": url,
        });

        if (container) {
            container.insertBefore(preview, container.firstChild);
        }
        else {
            link.parentNode.insertBefore(preview, link);
        }
        
        function removePreview () {
            if (preview && preview.parentNode) {
                preview.parentNode.removeChild(preview);
                preview = undefined;
            }
        }
    
        link.onmouseleave = removePreview;
        link.onclick = removePreview;
    };
}

function getPreviewLinks () {
    var excludedClasses = ["column-right", "no-preview", "figure", "toc" ];
    return nodeArray(document.body.getElementsByTagName("a")).filter(function (link) {
        return !ancestorWithTagName(link, "svg") &&
               !ancestorWithClass(link, excludedClasses) &&
               link.getAttribute("href") && link.getAttribute("href").substr(0,1) !== "#";
    });
}

function getPreviewURLsForLinks (links) {
    return links.map(function (link) { return link.getAttribute("href"); });
}

function getPreviewNamesForLinks (links) {
    return getPreviewURLsForLinks(links).map(getPreviewNameForLinkURL);
}


// don't show when scrolling, only when mousing deliberately

var recentlyScrolled = false;
var recentScrollTime = 0;

function setupRecentScroll () {
    window.addEventListener("scroll", function () {
        recentlyScrolled = true;
        recentScrollTime = Date.now();
    });
    document.body.addEventListener("mousemove", function () {
        if (!recentlyScrolled) { return; }
        var msSinceScroll = Date.now() - recentScrollTime;  // mousemove events are auto-generated after scroll
        if (msSinceScroll > 100) { recentlyScrolled = false; }      // so make sure this isn't one of those
    });
}


// preview url

function getPreviewNameForLinkURL (url) {
    return url.replace(/^h\w+\W+/,"").replace(/\/$/, "").replace(/\W+/g, "-") + ".jpg";
}

function getPreviewImageURLForLinkURL (url) {
    var name = getPreviewNameForLinkURL(url);
    return getPreviewImageURLForName(name);
}

function getPreviewImageURLForName (name) {
    var prefix = previewsComeFromAWS ? "http://s3.amazonaws.com/worrydream.com/ClimateChange/" : "";
    return prefix + "PreviewImages/" + name;
}

